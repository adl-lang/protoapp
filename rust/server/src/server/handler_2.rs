use poem::endpoint::{DynEndpoint, ToDynEndpoint};
use poem::listener::TcpListener;
use poem::{EndpointExt, Route, Server};

use crate::adl::custom::common::db::DbKey;
use crate::adl::gen::protoapp::apis::ui::{ApiRequests, Message, Paginated, RecentMessagesReq};
use crate::adl::gen::protoapp::{apis::ui::NewMessageReq, db::MessageId};

use super::poem_adl_interop::{new_access_token_checker, AdlReqContext, RouteExt};
use super::AppState;

type ReqContext = AdlReqContext<AppState>;

pub async fn run(state: AppState) -> Result<(), std::io::Error> {
    let ep = build_routes(state);
    Server::new(TcpListener::bind("0.0.0.0:3000")).run(ep).await
}

pub fn build_routes(state: AppState) -> Box<dyn DynEndpoint<Output = poem::Response>> {
    let access_token_checker = new_access_token_checker(state.config.jwt_access_secret.clone());

    let ep = Route::new()
        .adl_post(ApiRequests::def_new_message(), new_message)
        .adl_post(ApiRequests::def_recent_messages(), recent_messages)
        .data(state)
        .data(access_token_checker);

    Box::new(ToDynEndpoint(ep))
}

fn new_message(_ctx: ReqContext, _i: NewMessageReq) -> poem::Result<MessageId> {
    Ok(DbKey::new("X-"))
}

fn recent_messages(_ctx: ReqContext, _i: RecentMessagesReq) -> poem::Result<Paginated<Message>> {
    Ok(Paginated {
        items: Vec::new(),
        current_offset: 0,
        total_count: 0,
    })
}
