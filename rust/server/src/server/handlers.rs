use poem::handler;
use poem::web::cookie::{Cookie, CookieJar};
use poem::web::Json;

use crate::adl::custom::common::db::DbKey;
use crate::adl::gen::common::http::Unit;
use crate::adl::gen::protoapp::apis::ui::{
    ApiRequests, LoginReq, LoginResp, LoginTokens, Message, Paginated, QueryUsersReq,
    RecentMessagesReq, RefreshReq, RefreshResp, User, UserDetails, UserWithId, WithId,
};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::protoapp::db::{AppUser, AppUserId};
use crate::adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};
use crate::server::poem_adl_interop::get_adl_request_context;

use super::jwt::AccessClaims;
use super::passwords::{hash_password, verify_password};
use super::poem_adl_interop::{forbidden, AdlReqContext, HandlerResult};
use super::{db, jwt, AppState};

type ReqContext = AdlReqContext<AppState>;

pub async fn healthy(_ctx: ReqContext, _i: ()) -> HandlerResult<()> {
    Ok(())
}

pub async fn login(ctx: ReqContext, i: LoginReq) -> HandlerResult<LoginResp> {
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

pub async fn refresh(ctx: ReqContext, i: RefreshReq) -> HandlerResult<RefreshResp> {
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

pub async fn logout(_ctx: ReqContext, _i: Unit) -> HandlerResult<Unit> {
    Ok(Unit {})
}

pub async fn new_message(ctx: ReqContext, i: NewMessageReq) -> HandlerResult<MessageId> {
    let user_id = user_from_claims(&ctx.claims)?;
    let message_id = db::new_message(&ctx.state.db_pool, &user_id, &i.message).await?;
    Ok(message_id)
}

pub async fn recent_messages(
    ctx: ReqContext,
    i: RecentMessagesReq,
) -> HandlerResult<Paginated<Message>> {
    let messages = db::recent_messages(&ctx.state.db_pool, i.page.offset, i.page.limit).await?;
    let total_count = db::message_count(&ctx.state.db_pool).await?;
    Ok(Paginated {
        items: messages,
        current_offset: i.page.offset,
        total_count,
    })
}

pub async fn who_am_i(ctx: ReqContext, _i: ()) -> HandlerResult<UserWithId> {
    let user_id = user_from_claims(&ctx.claims)?;
    let user = db::get_user_with_id(&ctx.state.db_pool, &user_id).await?;
    match user {
        Some((user_id, user)) => Ok(UserWithId {
            id: user_id.clone(),
            value: User {
                fullname: user.fullname,
                email: user.email,
                is_admin: user.is_admin,
            },
        }),
        None => Err(forbidden()),
    }
}

pub async fn create_user(ctx: ReqContext, i: UserDetails) -> HandlerResult<AppUserId> {
    let hashed_password = hash_password(&i.password).expect("password can be hashed");
    let user = AppUser {
        fullname: i.fullname.clone(),
        email: i.email.clone(),
        is_admin: i.is_admin,
        hashed_password,
    };
    let id = db::create_user(&ctx.state.db_pool, &user).await?;
    Ok(id)
}

pub async fn update_user(
    ctx: ReqContext,
    i: WithId<AppUserId, UserDetails>,
) -> HandlerResult<Unit> {
    let hashed_password = hash_password(&i.value.password).expect("password can be hashed");
    let user = AppUser {
        fullname: i.value.fullname.clone(),
        email: i.value.email.clone(),
        is_admin: i.value.is_admin,
        hashed_password,
    };
    db::update_user(&ctx.state.db_pool, &i.id, &user).await?;
    Ok(Unit {})
}

pub async fn query_users(
    ctx: ReqContext,
    i: QueryUsersReq,
) -> HandlerResult<Paginated<UserWithId>> {
    let users = db::query_users(&ctx.state.db_pool, i.page.offset, i.page.limit).await?;
    let total_count = db::user_count(&ctx.state.db_pool).await?;
    let page = Paginated {
        items: users,
        current_offset: i.page.offset,
        total_count,
    };
    Ok(page)
}

#[handler]
pub async fn login_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    i: Json<LoginReq>,
) -> poem::Result<Json<LoginResp>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_login().security)?;
    let eresp = login(ctx, i.0).await;
    if let Ok(LoginResp::Tokens(tokens)) = &eresp {
        let mut cookie = Cookie::new_with_str(REFRESH_TOKEN, tokens.refresh_jwt.clone());
        cookie.set_http_only(true);
        cookies.add(cookie);
    }
    eresp.map(Json).map_err(poem::Error::from)
}

#[handler]
pub async fn refresh_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    mut i: Json<RefreshReq>,
) -> poem::Result<Json<RefreshResp>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_refresh().security)?;
    let token_from_cookie = cookies.get(REFRESH_TOKEN).map(|c| c.value_str().to_owned());

    // If there's no refresh token in the request, use the one from the cookie
    let refresh_token = i.0.refresh_token.or(token_from_cookie);

    let eresp = refresh(ctx, RefreshReq { refresh_token }).await;
    eresp.map(Json).map_err(poem::Error::from)
}

#[handler]
pub async fn logout_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    mut i: Json<Unit>,
) -> poem::Result<Json<Unit>> {
    let ctx = get_adl_request_context(req, &ApiRequests::def_refresh().security)?;
    cookies.remove(REFRESH_TOKEN);
    let eresp = logout(ctx, i.0).await;
    eresp.map(Json).map_err(poem::Error::from)
}

const REFRESH_TOKEN: &str = "refreshToken";

fn access_jwt_from_user(cfg: &ServerConfig, user_id: &AppUserId, user: &AppUser) -> String {
    if user.is_admin {
        jwt::create_admin_access(cfg, user_id.0.clone())
    } else {
        jwt::create_user_access(cfg, user_id.0.clone())
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
