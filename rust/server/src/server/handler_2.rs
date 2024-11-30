use poem::http::StatusCode;
use poem::listener::TcpListener;
use poem::{
    Endpoint, EndpointExt, FromRequest, IntoEndpoint, IntoResponse, Request, Response, Route,
    Server,
};
use poem::{RequestBody, RouteMethod};
use std::marker::PhantomData;
use std::sync::{Arc, Mutex};

use poem::web::Json;
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::adl::custom::common::db::DbKey;
use crate::adl::gen::common::http::HttpSecurity;
use crate::adl::gen::protoapp::apis::ui::{ApiRequests, Message, Paginated, RecentMessagesReq};
use crate::adl::gen::protoapp::config::server::ServerConfig;
use crate::adl::gen::{
    common::http::HttpPost,
    protoapp::{apis::ui::NewMessageReq, db::MessageId},
};

use super::{jwt, AppState};

type ReqContext = AdlReqContext<AppState>;

pub async fn run(state: AppState) -> Result<(), std::io::Error> {
    let app = Route::new()
        .add(adl_post(ApiRequests::def_new_message(), new_message))
        .add(adl_post(
            ApiRequests::def_recent_messages(),
            recent_messages,
        ))
        .data(state);

    Server::new(TcpListener::bind("0.0.0.0:3000"))
        .run(app)
        .await
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

//---------------------------------------------------------------------------

trait HasRouteMethod {
    fn route(self) -> (String, RouteMethod);
}

trait RouteExt {
    fn add<RM: HasRouteMethod>(self, rm: RM) -> Self;
}

impl RouteExt for Route {
    fn add<RM: HasRouteMethod>(self, rm: RM) -> Self {
        let (path, rm) = rm.route();
        self.at(&path, rm)
    }
}

type AdlResult<T> = poem::Result<T>;

struct AdlReqContext<S> {
    state: S,
    claims: Option<jwt::AccessClaims>,
}

trait JwtChecker {
    fn check_auth(
        &self,
        security: &HttpSecurity,
        auth_header: Option<&str>,
    ) -> AdlResult<Option<jwt::AccessClaims>>;
}

type DynJwtChecker = Arc<Box<dyn JwtChecker + Send + Sync>>;

//---------------------------------------------------------------------------

fn adl_post<S, F, I, O>(req: HttpPost<I, O>, f: F) -> AdlPost<S, F, I, O>
where
    S: Send + Sync + Clone + 'static,
    F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    AdlPost {
        req,
        handler: f,
        phantom: PhantomData,
    }
}

pub struct AdlPost<S, F, I, O>
where
    S: Send + Sync + Clone + 'static,
    F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    req: HttpPost<I, O>,
    handler: F,
    phantom: PhantomData<S>,
}

impl<S, F, I, O> HasRouteMethod for AdlPost<S, F, I, O>
where
    S: Send + Sync + Clone + 'static,
    F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    fn route(self) -> (String, RouteMethod) {
        (self.req.path.clone(), RouteMethod::new().post(self))
    }
}

impl<S, F, I, O> Endpoint for AdlPost<S, F, I, O>
where
    S: Send + Sync + Clone + 'static,
    F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    type Output = Response;
    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let jwt_checker = req
            .data::<DynJwtChecker>()
            .expect("JwtChecker should be configured");
        let state = req.data::<S>().expect("State should be configured").clone();
        let auth_header = req.header("Authorization");
        let claims = jwt_checker.check_auth(&self.req.security, auth_header)?;
        let mut body = RequestBody::new(req.take_body());
        let i: Json<I> = Json::from_request(&req, &mut body).await?;
        let ctx = AdlReqContext { state, claims };
        let o: O = (self.handler)(ctx, i.0)?;
        Ok(Json(o).into_response())
    }
}

//---------------------------------------------------------------------------

fn check_auth(
    cfg: &ServerConfig,
    security: &HttpSecurity,
    auth_header: Option<&str>,
) -> poem::Result<Option<jwt::AccessClaims>> {
    match security {
        HttpSecurity::Public => Ok(None),
        HttpSecurity::Token => {
            let claims = claims_from_bearer_token(cfg, auth_header)?;
            Ok(Some(claims))
        }
        HttpSecurity::TokenWithRole(role) => {
            let claims = claims_from_bearer_token(cfg, auth_header)?;
            if claims.role == *role {
                Ok(Some(claims))
            } else {
                Err(poem::Error::from_status(StatusCode::FORBIDDEN))
            }
        }
    }
}

fn claims_from_bearer_token(
    cfg: &ServerConfig,
    auth_header: Option<&str>,
) -> poem::Result<jwt::AccessClaims> {
    if let Some(jwt) = auth_header.and_then(get_bearer_token) {
        let claims = jwt::decode_access(cfg, &jwt).map_err(|e| {
            log::error!("failed to validate jwt: {}", e);
            poem::Error::from_status(StatusCode::FORBIDDEN)
        })?;
        return Ok(claims);
    }
    Err(poem::Error::from_status(StatusCode::FORBIDDEN))
}

fn get_bearer_token(auth_header: &str) -> Option<String> {
    let fields: Vec<&str> = auth_header.split_ascii_whitespace().collect();
    if fields.len() == 2 && *fields.get(0)?.to_lowercase() == "bearer".to_owned() {
        let token = *fields.get(1)?;
        return Some(token.to_owned());
    }
    None
}
