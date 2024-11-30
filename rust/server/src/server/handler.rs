use async_trait::async_trait;
use cookie::Cookie;
use hyper::header::{CONTENT_TYPE, COOKIE, SET_COOKIE};
use hyper::{Body, Method, Request, StatusCode};
use log::error;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::marker::PhantomData;

use super::jwt::AccessClaims;
use super::{db, Response};
use super::{jwt, AppState};
use crate::adl::custom::common::db::DbKey;
use crate::adl::gen::common::http::{HttpGet, HttpPost, HttpSecurity, Unit};
use crate::adl::gen::protoapp::apis;
use crate::adl::gen::protoapp::apis::ui::{
    LoginReq, LoginResp, LoginTokens, Message, NewMessageReq, Paginated, RecentMessagesReq,
    RefreshReq, RefreshResp, UserProfile,
};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::protoapp::db::{AppUser, AppUserId, MessageId};
use crate::server::passwords::verify_password;

pub async fn handler(app_state: AppState, req: Request<Body>) -> Result<Response, hyper::Error> {
    let resp = handle_req(&app_state, req).await;

    match resp {
        Ok(resp) => Ok(resp),
        Err(HandlerError::HttpError(code)) => Ok(make_err_response(code)),
        Err(HandlerError::Anyhow(aerr)) => {
            error!("Server Error: {:?}", aerr);
            Ok(make_err_response(StatusCode::INTERNAL_SERVER_ERROR))
        }
    }
}

const ALLOW_CORS: bool = true;

async fn handle_req(app_state: &AppState, req: Request<Body>) -> HandlerResult<Response> {
    if ALLOW_CORS {
        // TODO: we should really only do this for valid endpoints
        if req.method() == Method::OPTIONS {
            let resp = hyper::Response::builder()
                .status(200)
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Allow-Method", "*")
                .header("Access-Control-Allow-Origin", "*")
                .body(Body::empty())
                .unwrap();
            return Ok(resp);
        }
    }

    let endpoint = apis::ui::ApiRequests::def_healthy();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        return endpoint.encode_resp(Unit {});
    }

    let endpoint = apis::ui::ApiRequests::def_ping();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let o = ping(app_state, i).await?;
        return endpoint.encode_resp(o);
    }

    let endpoint = apis::ui::ApiRequests::def_login();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let o = login(app_state, i).await?;
        let mut resp = hyper::Response::builder()
            .status(200)
            .header("Access-Control-Allow-Origin", "*");
        if let LoginResp::Tokens(tokens) = &o {
            resp = resp.header(
                SET_COOKIE,
                Cookie::build((REFRESH_TOKEN, tokens.refresh_jwt.clone()))
                    .http_only(true)
                    .to_string(),
            )
        }
        let resp = with_json_body(resp, o)?;
        return Ok(resp);
    }

    let endpoint = apis::ui::ApiRequests::def_refresh();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let refresh_jwt = get_cookie(&req, REFRESH_TOKEN);
        let i = endpoint.decode_req(req).await?;
        let o = refresh(app_state, refresh_jwt, i).await?;
        return endpoint.encode_resp(o);
    }

    let endpoint = apis::ui::ApiRequests::def_logout();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let resp = hyper::Response::builder()
            .status(200)
            .header("Access-Control-Allow-Origin", "*")
            .header(
                SET_COOKIE,
                Cookie::build((REFRESH_TOKEN, ""))
                    .max_age(time::Duration::seconds(0))
                    .http_only(true)
                    .to_string(),
            );
        let resp = with_json_body(resp, i)?;
        return Ok(resp);
    }

    let endpoint = apis::ui::ApiRequests::def_new_message();
    if endpoint.matches(&req) {
        let claims = endpoint.require_auth(&app_state.config, &req)?;
        endpoint.check_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let o = new_message(app_state, &claims, i).await?;
        return endpoint.encode_resp(o);
    }

    let endpoint = apis::ui::ApiRequests::def_recent_messages();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let claims = endpoint.require_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let o = recent_messages(app_state, &claims, i).await?;
        return endpoint.encode_resp(o);
    }

    let endpoint = apis::ui::ApiRequests::def_who_am_i();
    if endpoint.matches(&req) {
        endpoint.check_auth(&app_state.config, &req)?;
        let claims = endpoint.require_auth(&app_state.config, &req)?;
        let o = who_am_i(app_state, &claims).await?;
        return endpoint.encode_resp(o);
    }

    log::error!("No handler for {} at {}", req.method(), req.uri());
    Err(HandlerError::from(StatusCode::NOT_FOUND))
}

async fn ping(_app_state: &AppState, i: Unit) -> HandlerResult<Unit> {
    Ok(i)
}

async fn login(app_state: &AppState, i: LoginReq) -> HandlerResult<LoginResp> {
    // Lookup the user details
    let user = db::get_user_with_email(&app_state.db_pool, &i.email).await?;
    match user {
        None => Ok(LoginResp::InvalidCredentials),
        Some((user_id, user)) => {
            if verify_password(&i.password, &user.hashed_password) {
                // If found and we have a valid password return an access token
                let access_jwt = access_jwt_from_user(&app_state.config, &user_id, &user);
                let refresh_jwt = jwt::create_refresh(&app_state.config, user_id.clone().0);
                Ok(LoginResp::Tokens(LoginTokens {
                    access_jwt,
                    refresh_jwt,
                }))
            } else {
                Ok(LoginResp::InvalidCredentials)
            }
        }
    }
}

fn access_jwt_from_user(cfg: &ServerConfig, user_id: &AppUserId, user: &AppUser) -> String {
    if user.is_admin {
        jwt::create_admin_access(&cfg, user_id.0.clone())
    } else {
        jwt::create_user_access(&cfg, user_id.0.clone())
    }
}

const REFRESH_TOKEN: &str = "refreshToken";

async fn refresh(
    app_state: &AppState,
    refresh_jwt_from_cookie: Option<String>,
    i: RefreshReq,
) -> HandlerResult<RefreshResp> {
    match i.refresh_token.or(refresh_jwt_from_cookie) {
        None => Ok(RefreshResp::InvalidRefreshToken),
        Some(refresh_jwt) => {
            let claims =
                match jwt::decode_refresh(&app_state.config.jwt_refresh_secret, &refresh_jwt) {
                    Ok(claims) => claims,
                    Err(_) => return Ok(RefreshResp::InvalidRefreshToken),
                };
            let user_id: AppUserId = DbKey(claims.sub.clone(), PhantomData);
            let user = db::get_user_with_id(&app_state.db_pool, &user_id).await?;
            let user = match user {
                Some((_, user)) => user,
                None => return Ok(RefreshResp::InvalidRefreshToken),
            };
            let access_jwt = access_jwt_from_user(&app_state.config, &user_id, &user);
            Ok(RefreshResp::AccessToken(access_jwt))
        }
    }
}

fn get_cookie(req: &Request<Body>, cookie_name: &str) -> Option<String> {
    let header_str = req.headers().get(COOKIE)?.to_str().ok()?;
    for cookie in Cookie::split_parse(header_str) {
        if let Ok(cookie) = cookie {
            if cookie.name() == cookie_name {
                return Some(cookie.value().to_owned());
            }
        }
    }
    None
}

async fn new_message(
    app_state: &AppState,
    claims: &AccessClaims,
    i: NewMessageReq,
) -> HandlerResult<MessageId> {
    let user_id = user_from_claims(claims)?;
    let message_id = db::new_message(&app_state.db_pool, &user_id, &i.message).await?;
    Ok(message_id)
}

async fn recent_messages(
    app_state: &AppState,
    _claims: &AccessClaims,
    i: RecentMessagesReq,
) -> HandlerResult<Paginated<Message>> {
    let messages = db::recent_messages(&app_state.db_pool, i.offset, i.limit).await?;
    let total_count = db::message_count(&app_state.db_pool).await?;
    Ok(Paginated {
        items: messages,
        current_offset: i.offset,
        total_count,
    })
}

async fn who_am_i(app_state: &AppState, claims: &AccessClaims) -> HandlerResult<UserProfile> {
    let user_id = user_from_claims(claims)?;
    let user = db::get_user_with_id(&app_state.db_pool, &user_id).await?;
    match user {
        Some((user_id, user)) => Ok(UserProfile {
            id: user_id.clone(),
            fullname: user.fullname,
            email: user.email,
            is_admin: user.is_admin,
        }),
        None => Err(forbidden("invalid user")),
    }
}

fn user_from_claims(claims: &jwt::AccessClaims) -> HandlerResult<AppUserId> {
    if claims.role == jwt::ROLE_USER || claims.role == jwt::ROLE_ADMIN {
        Ok(DbKey(claims.sub.clone(), PhantomData))
    } else {
        Err(internal_error("invalid user token"))
    }
}

fn internal_error(message: &str) -> HandlerError {
    log::error!("http internal server error: {}", message);
    HandlerError::HttpError(StatusCode::INTERNAL_SERVER_ERROR)
}

fn bad_request(message: &str) -> HandlerError {
    log::error!("http bad request: {}", message);
    HandlerError::HttpError(StatusCode::BAD_REQUEST)
}

fn forbidden(message: &str) -> HandlerError {
    log::error!("http forbidden: {}", message);
    HandlerError::HttpError(StatusCode::FORBIDDEN)
}

trait EndpointMatches {
    fn matches(&self, req: &Request<Body>) -> bool;
}

#[async_trait]
trait EndpointWithReqBody<I: DeserializeOwned> {
    async fn decode_req(&self, req: Request<Body>) -> HandlerResult<I>;
}

trait EndpointWithRespBody<O: Serialize> {
    fn encode_resp(&self, o: O) -> HandlerResult<Response>;
}

trait EndpointCheckAuth {
    fn check_auth(
        &self,
        cfg: &ServerConfig,
        req: &Request<Body>,
    ) -> HandlerResult<Option<jwt::AccessClaims>>;

    fn require_auth(
        &self,
        cfg: &ServerConfig,
        req: &Request<Body>,
    ) -> HandlerResult<jwt::AccessClaims> {
        match self.check_auth(cfg, req)? {
            Some(claims) => Ok(claims),
            None => Err(HandlerError::HttpError(StatusCode::FORBIDDEN)),
        }
    }
}

impl<I, O> EndpointMatches for HttpPost<I, O> {
    fn matches(&self, req: &Request<Body>) -> bool {
        return req.method() == Method::POST && self.path == req.uri().path();
    }
}

impl<I, O> EndpointCheckAuth for HttpPost<I, O> {
    fn check_auth(
        &self,
        cfg: &ServerConfig,
        req: &Request<Body>,
    ) -> HandlerResult<Option<jwt::AccessClaims>> {
        check_auth(cfg, &self.security, req)
    }
}

#[async_trait]
impl<I: DeserializeOwned + Sync, O: Sync> EndpointWithReqBody<I> for HttpPost<I, O> {
    async fn decode_req(&self, req: Request<Body>) -> HandlerResult<I> {
        let body_bytes = hyper::body::to_bytes(req.into_body()).await?;
        let body_string = String::from_utf8(body_bytes.to_vec()).unwrap();
        let i = serde_json::from_str(&body_string).map_err(|e| bad_request(&format!("{}", e)))?;
        Ok(i)
    }
}

impl<I, O: Serialize> EndpointWithRespBody<O> for HttpPost<I, O> {
    fn encode_resp(&self, o: O) -> HandlerResult<Response> {
        let resp = hyper::Response::builder()
            .status(200)
            .header("Access-Control-Allow-Origin", "*");
        let resp = with_json_body(resp, o)?;
        Ok(resp)
    }
}

impl<O> EndpointMatches for HttpGet<O> {
    fn matches(&self, req: &Request<Body>) -> bool {
        return req.method() == Method::GET && self.path == req.uri().path();
    }
}

impl<O> EndpointCheckAuth for HttpGet<O> {
    fn check_auth(
        &self,
        cfg: &ServerConfig,
        req: &Request<Body>,
    ) -> HandlerResult<Option<jwt::AccessClaims>> {
        check_auth(cfg, &self.security, req)
    }
}

impl<O: Serialize> EndpointWithRespBody<O> for HttpGet<O> {
    fn encode_resp(&self, o: O) -> HandlerResult<Response> {
        let resp = hyper::Response::builder()
            .status(200)
            .header("Access-Control-Allow-Origin", "*");
        let resp = with_json_body(resp, o)?;
        Ok(resp)
    }
}

fn with_json_body<O: Serialize>(resp: http::response::Builder, o: O) -> HandlerResult<Response> {
    let s = serde_json::to_string(&o).expect("object should be serializeable");
    let resp = resp
        .header(CONTENT_TYPE, "application/json")
        .body(hyper::Body::from(s))?;
    Ok(resp)
}

fn make_err_response(code: StatusCode) -> Response {
    hyper::Response::builder()
        .status(code)
        .body(Body::empty())
        .unwrap()
}

fn check_auth(
    cfg: &ServerConfig,
    security: &HttpSecurity,
    req: &Request<Body>,
) -> HandlerResult<Option<jwt::AccessClaims>> {
    match security {
        HttpSecurity::Public => Ok(None),
        HttpSecurity::Token => {
            let claims = claims_from_bearer_token(cfg, req)?;
            Ok(Some(claims))
        }
        HttpSecurity::TokenWithRole(role) => {
            let claims = claims_from_bearer_token(cfg, req)?;
            if claims.role == *role {
                Ok(Some(claims))
            } else {
                Err(HandlerError::HttpError(StatusCode::FORBIDDEN))
            }
        }
    }
}

fn claims_from_bearer_token(
    cfg: &ServerConfig,
    req: &Request<Body>,
) -> HandlerResult<jwt::AccessClaims> {
    if let Some(jwt) = get_bearer_token(req) {
        let claims = jwt::decode_access(&cfg.jwt_access_secret, &jwt).map_err(|e| {
            log::error!("failed to validate jwt: {}", e);
            HandlerError::HttpError(StatusCode::FORBIDDEN)
        })?;
        return Ok(claims);
    }
    return Err(HandlerError::HttpError(StatusCode::FORBIDDEN));
}

fn get_bearer_token(req: &Request<Body>) -> Option<String> {
    if let Some(value) = req.headers().get("Authorization") {
        let fields: Vec<&str> = value.to_str().ok()?.split_ascii_whitespace().collect();
        if fields.len() == 2 && *fields.get(0)?.to_lowercase() == "bearer".to_owned() {
            let token = *fields.get(1)?;
            return Some(token.to_owned());
        }
    }
    None
}

enum HandlerError {
    Anyhow(anyhow::Error),
    HttpError(StatusCode),
}

type HandlerResult<T> = Result<T, HandlerError>;

impl From<anyhow::Error> for HandlerError {
    fn from(err: anyhow::Error) -> HandlerError {
        HandlerError::Anyhow(err)
    }
}

impl From<sqlx::Error> for HandlerError {
    fn from(err: sqlx::Error) -> HandlerError {
        HandlerError::Anyhow(anyhow::anyhow!("sqlx error: {}", err.to_string()))
    }
}

impl From<StatusCode> for HandlerError {
    fn from(code: StatusCode) -> HandlerError {
        HandlerError::HttpError(code)
    }
}

impl From<http::Error> for HandlerError {
    fn from(err: http::Error) -> HandlerError {
        HandlerError::Anyhow(anyhow::anyhow!("http error: {}", err.to_string()))
    }
}

impl From<hyper::Error> for HandlerError {
    fn from(err: hyper::Error) -> HandlerError {
        HandlerError::Anyhow(anyhow::anyhow!("hyper error: {}", err.to_string()))
    }
}
