use poem::endpoint::{DynEndpoint, ToDynEndpoint};
use poem::web::cookie::{Cookie, CookieJar};
use poem::web::Json;
use poem::{handler, post, EndpointExt, Route};

use crate::adl::custom::common::db::DbKey;
use crate::adl::gen::common::http::Unit;
use crate::adl::gen::protoapp::apis::ui::{
    ApiRequests, LoginReq, LoginResp, LoginTokens, Message, Paginated, RecentMessagesReq,
    RefreshReq, RefreshResp, UserProfile,
};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::protoapp::db::{AppUser, AppUserId};
use crate::adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};
use crate::server::poem_adl_interop::get_adl_request_context;

use super::jwt::AccessClaims;
use super::passwords::verify_password;
use super::poem_adl_interop::{
    forbidden, new_access_token_checker, AdlReqContext, HandlerResult, RouteExt,
};
use super::{db, jwt, AppState};
use poem::session::{CookieConfig, CookieSession};

type ReqContext = AdlReqContext<AppState>;

pub fn build_routes(state: AppState) -> Box<dyn DynEndpoint<Output = poem::Response>> {
    let access_token_checker = new_access_token_checker(state.config.jwt_access_secret.clone());

    let routes = Route::new();

    // Add standard ADL implemented methods
    let routes = routes
        .adl_get(ApiRequests::def_healthy(), healthy)
        .adl_get(ApiRequests::def_who_am_i(), who_am_i)
        .adl_post(ApiRequests::def_ping(), ping)
        .adl_post(ApiRequests::def_new_message(), new_message)
        .adl_post(ApiRequests::def_recent_messages(), recent_messages);

    // Add methods need custom implementations in order to deal with cookies
    let routes = routes
        .at(ApiRequests::def_login().path, post(login_with_cookies))
        .at(ApiRequests::def_refresh().path, post(refresh_with_cookies))
        .at(ApiRequests::def_logout().path, post(logout_with_cookies));

    // Add system state and required middleware
    let routes = routes
        .data(state)
        .data(access_token_checker)
        .with(CookieSession::new(CookieConfig::default().secure(false)));

    Box::new(ToDynEndpoint(routes))
}

async fn ping(_ctx: ReqContext, _i: Unit) -> HandlerResult<Unit> {
    Ok(Unit {})
}

async fn healthy(_ctx: ReqContext) -> HandlerResult<Unit> {
    Ok(Unit {})
}

async fn login(ctx: ReqContext, i: LoginReq) -> HandlerResult<LoginResp> {
    // Lookup the user details
    let user = db::get_user_with_email(&ctx.state.db_pool, &i.email).await?;
    match user {
        None => Ok(LoginResp::InvalidCredentials),
        Some((user_id, user)) => {
            if verify_password(&i.password, &user.hashed_password) {
                // If found and we have a valid password return an access token and refresh token
                let access_jwt = access_jwt_from_user(&ctx.state.config, &user_id, &user);
                let refresh_jwt = jwt::create_refresh(&ctx.state.config, user_id.clone().0);
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

async fn refresh(ctx: ReqContext, i: RefreshReq) -> HandlerResult<RefreshResp> {
    match i.refresh_token {
        None => Ok(RefreshResp::InvalidRefreshToken),
        Some(refresh_jwt) => {
            let claims =
                match jwt::decode_refresh(&ctx.state.config.jwt_refresh_secret, &refresh_jwt) {
                    Ok(claims) => claims,
                    Err(_) => return Ok(RefreshResp::InvalidRefreshToken),
                };
            let user_id: AppUserId = DbKey::from_string(claims.sub.clone());
            let user = db::get_user_with_id(&ctx.state.db_pool, &user_id).await?;
            let user = match user {
                Some((_, user)) => user,
                None => return Ok(RefreshResp::InvalidRefreshToken),
            };
            let access_jwt = access_jwt_from_user(&ctx.state.config, &user_id, &user);
            Ok(RefreshResp::AccessToken(access_jwt))
        }
    }
}

async fn logout(_ctx: ReqContext, _i: Unit) -> HandlerResult<Unit> {
    Ok(Unit {})
}

const REFRESH_TOKEN: &str = "refreshToken";

#[handler]
async fn login_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    i: Json<LoginReq>,
) -> poem::Result<Json<LoginResp>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_login().security)?;
    let eresp = login(ctx, i.0).await;
    if let Ok(LoginResp::Tokens(tokens)) = &eresp {
        let mut cookie = Cookie::new(REFRESH_TOKEN, tokens.refresh_jwt.clone());
        cookie.set_http_only(true);
        cookies.add(cookie);
    }
    eresp.map(|v| Json(v)).map_err(|e| poem::Error::from(e))
}

#[handler]
async fn refresh_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    mut i: Json<RefreshReq>,
) -> poem::Result<Json<RefreshResp>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_refresh().security)?;

    // If there's no refresh token in the request, try getting it from the cookie
    let refresh_token =
        i.0.refresh_token
            .or(cookies.get(REFRESH_TOKEN).map(|c| c.value_str().to_owned()));

    let eresp = refresh(ctx, RefreshReq { refresh_token }).await;
    eresp.map(|v| Json(v)).map_err(|e| poem::Error::from(e))
}

#[handler]
async fn logout_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    mut i: Json<Unit>,
) -> poem::Result<Json<Unit>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_refresh().security)?;
    cookies.remove(REFRESH_TOKEN);
    let eresp = logout(ctx, i.0).await;
    eresp.map(|v| Json(v)).map_err(|e| poem::Error::from(e))
}

fn access_jwt_from_user(cfg: &ServerConfig, user_id: &AppUserId, user: &AppUser) -> String {
    if user.is_admin {
        jwt::create_admin_access(&cfg, user_id.0.clone())
    } else {
        jwt::create_user_access(&cfg, user_id.0.clone())
    }
}

async fn new_message(ctx: ReqContext, i: NewMessageReq) -> HandlerResult<MessageId> {
    let user_id = user_from_claims(&ctx.claims)?;
    let message_id = db::new_message(&ctx.state.db_pool, &user_id, &i.message).await?;
    Ok(message_id)
}

async fn recent_messages(
    ctx: ReqContext,
    i: RecentMessagesReq,
) -> HandlerResult<Paginated<Message>> {
    let messages = db::recent_messages(&ctx.state.db_pool, i.offset, i.limit).await?;
    let total_count = db::message_count(&ctx.state.db_pool).await?;
    Ok(Paginated {
        items: messages,
        current_offset: i.offset,
        total_count,
    })
}

async fn who_am_i(ctx: ReqContext) -> HandlerResult<UserProfile> {
    let user_id = user_from_claims(&ctx.claims)?;
    let user = db::get_user_with_id(&ctx.state.db_pool, &user_id).await?;
    match user {
        Some((user_id, user)) => Ok(UserProfile {
            id: user_id.clone(),
            fullname: user.fullname,
            email: user.email,
            is_admin: user.is_admin,
        }),
        None => Err(forbidden()),
    }
}

fn user_from_claims(oclaims: &Option<AccessClaims>) -> HandlerResult<AppUserId> {
    if let Some(claims) = oclaims {
        if claims.role == jwt::ROLE_USER || claims.role == jwt::ROLE_ADMIN {
            return Ok(DbKey::from_string(claims.sub.clone()));
        }
    }
    Err(forbidden())
}
