use poem::endpoint::{DynEndpoint, ToDynEndpoint};
use poem::{EndpointExt, Route};

use crate::adl::gen::common::http::Unit;
use crate::adl::gen::protoapp::apis::ui::{
    ApiRequests, LoginReq, LoginResp, LoginTokens, Message, Paginated, RecentMessagesReq,
};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::protoapp::db::{AppUser, AppUserId};
use crate::adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};

use super::passwords::verify_password;
use super::poem_adl_interop::{new_access_token_checker, AdlReqContext, HandlerResult, RouteExt};
use super::{db, jwt, AppState};

type ReqContext = AdlReqContext<AppState>;

pub fn build_routes(state: AppState) -> Box<dyn DynEndpoint<Output = poem::Response>> {
    let access_token_checker = new_access_token_checker(state.config.jwt_access_secret.clone());

    let ep = Route::new()
        .adl_post(ApiRequests::def_ping(), ping)
        .adl_post(ApiRequests::def_login(), login)
        .adl_post(ApiRequests::def_new_message(), new_message)
        .adl_post(ApiRequests::def_recent_messages(), recent_messages)
        .data(state)
        .data(access_token_checker);

    Box::new(ToDynEndpoint(ep))
}

async fn ping(_ctx: ReqContext, _i: Unit) -> HandlerResult<Unit> {
    Ok(Unit {})
}

async fn login(ctx: ReqContext, i: LoginReq) -> HandlerResult<LoginResp> {
    // Lookup the user details
    let user = db::get_user_with_email(&ctx.state.db_pool, &i.email).await?;
    match user {
        None => Ok(LoginResp::InvalidCredentials),
        Some((user_id, user)) => {
            if verify_password(&i.password, &user.hashed_password) {
                // If found and we have a valid password return an access token
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

fn access_jwt_from_user(cfg: &ServerConfig, user_id: &AppUserId, user: &AppUser) -> String {
    if user.is_admin {
        jwt::create_admin_access(&cfg, user_id.0.clone())
    } else {
        jwt::create_user_access(&cfg, user_id.0.clone())
    }
}

async fn new_message(_ctx: ReqContext, _i: NewMessageReq) -> HandlerResult<MessageId> {
    todo!()
}

async fn recent_messages(
    _ctx: ReqContext,
    _i: RecentMessagesReq,
) -> HandlerResult<Paginated<Message>> {
    todo!()
}
