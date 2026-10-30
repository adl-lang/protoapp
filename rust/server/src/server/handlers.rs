use std::sync::Arc;

use poem::handler;
use poem::web::cookie::{Cookie, CookieJar};
use poem::web::Json;

use adl::custom::common::db::DbKey;
use adl::gen::common::http::Unit;
use adl::gen::protoapp::apis::ui::{
    AdminApiEndpoints, ApiEndpoints, LoginReq, LoginResp, LoginTokens, Message, Paginated,
    QueryUsersReq, RecentMessagesReq, RefreshReq, RefreshResp, User, UserDetails, UserWithId,
    WebApiEndpoints, WithId,
};
use adl::gen::protoapp::config::server::ServerConfig;
use adl::gen::protoapp::db::{AppUser, AppUserId};
use adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};

use crate::server::jwt::AccessClaims;
use crate::server::passwords::{hash_password, verify_password};
use crate::server::poem_adl_interop::{
    forbidden, get_adl_request_context, AdlReqContext, HandlerError,
};
use crate::server::{db, jwt, AppState};

type ReqContext = AdlReqContext<AppState>;

/// Implements the generated [`ApiEndpoints`] trait, which carries one method per
/// endpoint declared in the ADL `Api` struct. Adding an endpoint there stops
/// this impl compiling until it is implemented.
///
/// The admin endpoints are on [`AdminApiHandlersImpl`] below, since the ADL
/// nests them in their own struct; this impl names that type as its `Admin`
/// associated type and yields it from `admin`, which is how the generated
/// registration reaches it. The cookie endpoints are in the
/// [`WebApiEndpoints`] impl after that. They belong to the ADL `WebApi` struct
/// and are mounted by hand, since they need poem's `CookieJar`, but
/// implementing the generated trait keeps them checked against the ADL in the
/// same way.
pub struct ApiHandlersImpl {}

impl ApiHandlersImpl {
    pub fn new() -> Self {
        Self {}
    }
}

impl ApiEndpoints<ReqContext> for ApiHandlersImpl {
    type Error = HandlerError;

    /// Every endpoint whose ADL policy is not `public` is handed one of these,
    /// already checked against that policy. There is nothing to verify here,
    /// and no way to write a handler that forgets to.
    type Identity = AccessClaims;

    type Admin = AdminApiHandlersImpl;
    fn admin(&self) -> Arc<AdminApiHandlersImpl> {
        Arc::new(AdminApiHandlersImpl)
    }

    async fn healthy(&self, _ctx: &ReqContext, _req: ()) -> Result<(), Self::Error> {
        Ok(())
    }

    async fn new_message(
        &self,
        ctx: &ReqContext,
        identity: AccessClaims,
        req: NewMessageReq,
    ) -> Result<MessageId, Self::Error> {
        let user_id: AppUserId = DbKey::from_string(identity.sub);
        let message_id = db::new_message(&ctx.state.db_pool, &user_id, &req.message).await?;
        Ok(message_id)
    }

    async fn recent_messages(
        &self,
        ctx: &ReqContext,
        _identity: AccessClaims,
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

    async fn who_am_i(
        &self,
        ctx: &ReqContext,
        identity: AccessClaims,
        _req: (),
    ) -> Result<UserWithId, Self::Error> {
        let user_id: AppUserId = DbKey::from_string(identity.sub);
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
}

pub struct AdminApiHandlersImpl;

/// Implements the generated [`AdminApiEndpoints`] trait, for the ADL `AdminApi`
/// struct nested at `Api.admin`. Its endpoints are mounted under that field
/// name, so `create_user` is at `/admin/create_user`.
///
/// A nested API gets its own handler trait rather than contributing methods to
/// the enclosing one, and its own handler type. The enclosing trait identifies
/// a mount point by its ADL field rather than by its type, so the same API
/// nested at two fields would be served by two implementations, chosen
/// independently.
impl AdminApiEndpoints<ReqContext> for AdminApiHandlersImpl {
    type Error = HandlerError;
    type Identity = AccessClaims;

    async fn create_user(
        &self,
        ctx: &ReqContext,
        _identity: AccessClaims,
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
        ctx: &ReqContext,
        _identity: AccessClaims,
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
        ctx: &ReqContext,
        _identity: AccessClaims,
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

pub struct WebApiHandlersImpl;

impl WebApiEndpoints<ReqContext> for WebApiHandlersImpl {
    type Error = HandlerError;

    /// Never used: every `WebApi` endpoint is `public`, so none of the methods
    /// below takes an identity. The associated type still has to be named.
    type Identity = AccessClaims;

    async fn login(&self, ctx: &ReqContext, i: LoginReq) -> Result<LoginResp, Self::Error> {
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

    async fn refresh(&self, ctx: &ReqContext, i: RefreshReq) -> Result<RefreshResp, Self::Error> {
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

    async fn logout(&self, _ctx: &ReqContext, _i: Unit) -> Result<Unit, Self::Error> {
        Ok(Unit {})
    }
}

#[handler]
pub async fn login_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    i: Json<LoginReq>,
) -> poem::Result<Json<LoginResp>> {
    let ctx = get_adl_request_context(req);
    let eresp = WebApiHandlersImpl.login(&ctx, i.0).await;
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
    let ctx = get_adl_request_context(req);
    let token_from_cookie = cookies.get(REFRESH_TOKEN).map(|c| c.value_str().to_owned());

    // If there's no refresh token in the request, use the one from the cookie
    let refresh_token = i.0.refresh_token.or(token_from_cookie);

    let eresp = WebApiHandlersImpl
        .refresh(&ctx, RefreshReq { refresh_token })
        .await;
    eresp.map(Json).map_err(poem::Error::from)
}

#[handler]
pub async fn logout_with_cookies(
    req: &poem::Request,
    cookies: &CookieJar,
    mut i: Json<Unit>,
) -> poem::Result<Json<Unit>> {
    let ctx = get_adl_request_context(req);
    cookies.remove(REFRESH_TOKEN);
    let eresp = WebApiHandlersImpl.logout(&ctx, i.0).await;
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
