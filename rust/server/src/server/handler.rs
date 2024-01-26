use std::marker::PhantomData;

use async_trait::async_trait;
use hyper::{Body, Method, Request, StatusCode};
use log::error;
use serde::de::DeserializeOwned;
use serde::Serialize;

use super::jwt::Claims;
use super::{db, Response};
use super::{jwt, AppState};
use crate::adl::custom::DbKey;
use crate::adl::gen::common::http::{HttpGet, HttpPost, HttpSecurity, Unit};
use crate::adl::gen::protoapp::apis;
use crate::adl::gen::protoapp::apis::ui::{
    LoginReq, LoginResp, Message, NewMessageReq, Paginated, RecentMessagesReq,
};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::protoapp::db::{AppUserId, MessageId};
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
        return endpoint.encode_resp(o);
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
        let claims = endpoint.require_auth(&app_state.config, &req)?;
        endpoint.check_auth(&app_state.config, &req)?;
        let i = endpoint.decode_req(req).await?;
        let o = recent_messages(app_state, &claims, i).await?;
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
        Some(user) => {
            if verify_password(&i.password, &user.value.hashed_password) {
                // If found and we have a valid password return an access token
                let jwt = if user.value.is_admin {
                    jwt::create_admin(&app_state.config, user.id)
                } else {
                    jwt::create_user(&app_state.config, user.id)
                };
                Ok(LoginResp::AccessToken(jwt))
            } else {
                Ok(LoginResp::InvalidCredentials)
            }
        }
    }
}

async fn new_message(
    app_state: &AppState,
    claims: &Claims,
    i: NewMessageReq,
) -> HandlerResult<MessageId> {
    let user_id = user_from_claims(claims)?;
    let message_id = db::new_message(&app_state.db_pool, &user_id, &i.message).await?;
    Ok(message_id)
}

async fn recent_messages(
    app_state: &AppState,
    _claims: &Claims,
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

fn user_from_claims(claims: &jwt::Claims) -> HandlerResult<AppUserId> {
    if claims.role == jwt::ROLE_USER || claims.role == jwt::ROLE_ADMIN {
        Ok(DbKey(claims.sub.clone(), PhantomData))
    } else {
        Err(internal_error("invalid user token"))
    }
}

fn require_admin_in_claims(claims: &jwt::Claims) -> HandlerResult<()> {
    if claims.role != jwt::ROLE_ADMIN {
        return Err(forbidden("admin required"));
    }
    Ok(())
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
    ) -> HandlerResult<Option<jwt::Claims>>;

    fn require_auth(&self, cfg: &ServerConfig, req: &Request<Body>) -> HandlerResult<jwt::Claims> {
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
    ) -> HandlerResult<Option<jwt::Claims>> {
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
        let s = serde_json::to_string(&o).expect("object should be serializeable");
        Ok(make_response(hyper::Body::from(s), "application/json"))
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
    ) -> HandlerResult<Option<jwt::Claims>> {
        check_auth(cfg, &self.security, req)
    }
}

impl<O: Serialize> EndpointWithRespBody<O> for HttpGet<O> {
    fn encode_resp(&self, o: O) -> HandlerResult<Response> {
        let s = serde_json::to_string(&o).expect("object should be serializeable");
        Ok(make_response(hyper::Body::from(s), "application/json"))
    }
}

fn make_response(body: hyper::Body, content_type: &str) -> Response {
    hyper::Response::builder()
        .status(200)
        .header("Content-Type", content_type)
        .header("Access-Control-Allow-Origin", "*")
        .body(body)
        .unwrap()
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
) -> HandlerResult<Option<jwt::Claims>> {
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

fn claims_from_bearer_token(cfg: &ServerConfig, req: &Request<Body>) -> HandlerResult<jwt::Claims> {
    if let Some(jwt) = get_bearer_token(req) {
        let claims = jwt::decode(cfg, &jwt).map_err(|e| {
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

impl From<hyper::Error> for HandlerError {
    fn from(err: hyper::Error) -> HandlerError {
        HandlerError::Anyhow(anyhow::anyhow!("hyper error: {}", err.to_string()))
    }
}
