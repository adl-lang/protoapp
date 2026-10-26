use poem::handler;
use poem::web::cookie::{Cookie, CookieJar};
use poem::web::Json;

use adl::custom::common::db::DbKey;
use adl::gen::common::http::Unit;
use adl::gen::protoapp::apis::ui::{
    ApiRequestsHandlers, LoginReq, LoginResp, LoginTokens, Message, Paginated, QueryUsersReq,
    RecentMessagesReq, RefreshReq, RefreshResp, User, UserDetails, UserWithId, WebRequests, WithId,
};
use adl::gen::protoapp::config::server::ServerConfig;
use adl::gen::protoapp::db::{AppUser, AppUserId};
use adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};

use crate::server::jwt::AccessClaims;
use crate::server::passwords::{hash_password, verify_password};
use crate::server::poem_adl_interop::{
    forbidden, get_adl_request_context, AdlReqContext, HandlerError, HandlerResult,
};
use crate::server::{db, jwt, AppState};

type ReqContext = AdlReqContext<AppState>;

/// Implements the generated [`ApiRequestsHandlers`] trait, which carries one
/// method per endpoint declared in the ADL `ApiRequests` struct. Adding an
/// endpoint there stops this impl compiling until it is implemented.
///
/// The cookie endpoints are not here: they belong to the ADL `WebRequests`
/// struct and are wired by hand below, since they need poem's `CookieJar`.
pub struct Handlers;

impl ApiRequestsHandlers<ReqContext> for Handlers {
    type Error = HandlerError;

    async fn healthy(&self, _ctx: ReqContext, _req: ()) -> Result<(), Self::Error> {
        Ok(())
    }

    async fn new_message(
        &self,
        ctx: ReqContext,
        req: NewMessageReq,
    ) -> Result<MessageId, Self::Error> {
        let user_id = user_from_claims(&ctx.claims)?;
        let message_id = db::new_message(&ctx.state.db_pool, &user_id, &req.message).await?;
        Ok(message_id)
    }

    async fn recent_messages(
        &self,
        ctx: ReqContext,
        req: RecentMessagesReq,
    ) -> Result<Paginated<Message>, Self::Error> {
        let messages =
            db::recent_messages(&ctx.state.db_pool, req.page.offset, req.page.limit).await?;
        let total_count = db::message_count(&ctx.state.db_pool).await?;
        Ok(Paginated {
            items: messages,
            current_offset: req.page.offset,
            total_count,
        })
    }

    async fn who_am_i(&self, ctx: ReqContext, _req: ()) -> Result<UserWithId, Self::Error> {
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

    async fn create_user(
        &self,
        ctx: ReqContext,
        req: UserDetails,
    ) -> Result<AppUserId, Self::Error> {
        let hashed_password = hash_password(&req.password).expect("password can be hashed");
        let user = AppUser {
            fullname: req.fullname.clone(),
            email: req.email.clone(),
            is_admin: req.is_admin,
            hashed_password,
        };
        let id = db::create_user(&ctx.state.db_pool, &user).await?;
        Ok(id)
    }

    async fn update_user(
        &self,
        ctx: ReqContext,
        req: WithId<AppUserId, UserDetails>,
    ) -> Result<Unit, Self::Error> {
        let hashed_password = hash_password(&req.value.password).expect("password can be hashed");
        let user = AppUser {
            fullname: req.value.fullname.clone(),
            email: req.value.email.clone(),
            is_admin: req.value.is_admin,
            hashed_password,
        };
        db::update_user(&ctx.state.db_pool, &req.id, &user).await?;
        Ok(Unit {})
    }

    async fn query_users(
        &self,
        ctx: ReqContext,
        req: QueryUsersReq,
    ) -> Result<Paginated<UserWithId>, Self::Error> {
        let users = db::query_users(&ctx.state.db_pool, req.page.offset, req.page.limit).await?;
        let total_count = db::user_count(&ctx.state.db_pool).await?;
        let page = Paginated {
            items: users,
            current_offset: req.page.offset,
            total_count,
        };
        Ok(page)
    }
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

#[handler]
pub async fn login_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    i: Json<LoginReq>,
) -> poem::Result<Json<LoginResp>> {
    let ctx = get_adl_request_context(req, &WebRequests::def_login().security)?;
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
    let ctx = get_adl_request_context(req, &WebRequests::def_refresh().security)?;
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
    let ctx = get_adl_request_context(req, &WebRequests::def_logout().security)?;
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
