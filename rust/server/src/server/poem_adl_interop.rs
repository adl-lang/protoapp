use poem::endpoint::ToDynEndpoint;
use poem::error::ParseJsonError;
use poem::http::StatusCode;
use poem::web::Json;
use poem::RequestBody;
use poem::{
    Endpoint, EndpointExt, FromRequest, IntoEndpoint, IntoResponse, Middleware, Request, Response,
    Route,
};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use adl::api::{Api, Handler, Mount};
use adl::gen::common::http::{HttpMethod, HttpReq, HttpSecurity};

use super::jwt;
use super::AppState;

/**
 * Contextual information available to ADL request handlers
 */
pub struct AdlReqContext<S> {
    pub state: S,
    pub claims: Option<jwt::AccessClaims>,
}

/**
 *  Result type for ADL request handlers
 */
pub type HandlerResult<T> = Result<T, HandlerError>;

pub enum HandlerError {
    Anyhow(anyhow::Error), // results in a server 500 response
    Poem(poem::Error),
}

/// Mount an ADL endpoint whose handler has been erased to a boxed closure.
///
/// `adl_req` above takes a plain `fn` pointer, which suits hand-written
/// registration. The generated `register` works with trait methods instead, so
/// it needs this variant (design doc item 7).
pub trait DynRouteExt {
    fn adl_dyn_req<S, I, O>(
        self,
        req: &HttpReq<I, O>,
        handler: adl::api::Handler<AdlReqContext<S>, I, O, HandlerError>,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static;
}

impl DynRouteExt for Route {
    fn adl_dyn_req<S, I, O>(
        self,
        req: &HttpReq<I, O>,
        handler: adl::api::Handler<AdlReqContext<S>, I, O, HandlerError>,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
    {
        let path = req.path.clone();
        self.at(
            path,
            AdlDynReq {
                // Only the method and security are needed at call time, and
                // copying them avoids requiring `I: Clone, O: Clone`, which
                // HttpReq's derived Clone would otherwise demand.
                method: req.method.clone(),
                security: req.security.clone(),
                handler,
            },
        )
    }
}

struct AdlDynReq<S, I, O> {
    method: HttpMethod,
    security: HttpSecurity,
    handler: adl::api::Handler<AdlReqContext<S>, I, O, HandlerError>,
}

impl<S, I, O> Endpoint for AdlDynReq<S, I, O>
where
    S: Send + Sync + Clone + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    type Output = Response;
    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let mut body = RequestBody::new(req.take_body());
        let ctx = get_adl_request_context(&req, &self.security)?;
        let i: I = match self.method {
            HttpMethod::Get => decode_query_string(req)?,
            HttpMethod::Post => Json::from_request(&req, &mut body).await?.0,
        };
        let o = (self.handler)(ctx, i).await?;
        Ok(Json(o).into_response())
    }
}

pub trait JwtSecurityCheck {
    fn check_security(
        &self,
        security: &HttpSecurity,
        auth_header: Option<&str>,
    ) -> HandlerResult<Option<jwt::AccessClaims>>;
}

pub type DynJwtSecurityCheck = Arc<Box<dyn JwtSecurityCheck + Send + Sync>>;

//---------------------------------------------------------------------------

// Here we implement the query string -> ADL value transform. The rules are
//    if I is Void, we allow no query string
//    otherwise we expect a query string of form
//
//      input=${encodeURIComponent(serde_json::to_string(i))}
//
fn decode_query_string<I: DeserializeOwned>(req: Request) -> poem::Result<I> {
    let query_str = req.uri().query();
    match query_str {
        None => {
            let i =
                serde_json::from_value(serde_json::Value::Null).map_err(ParseJsonError::Parse)?;
            Ok(i)
        }
        Some(_) => {
            let params: Params = req.params()?;
            let i = serde_json::from_str(&params.input).map_err(ParseJsonError::Parse)?;
            Ok(i)
        }
    }
}

#[derive(Deserialize)]
struct Params {
    input: String,
}

//---------------------------------------------------------------------------

pub fn get_adl_request_context<S: Send + Sync + Clone + 'static>(
    req: &poem::Request,
    security: &HttpSecurity,
) -> poem::Result<AdlReqContext<S>> {
    let jwt_checker = req
        .data::<DynJwtSecurityCheck>()
        .expect("JwtChecker should be configured");
    let state = req.data::<S>().expect("State should be configured").clone();
    let auth_header = req.header("Authorization");
    let claims = jwt_checker.check_security(security, auth_header)?;
    let ctx = AdlReqContext { state, claims };
    Ok(ctx)
}

#[derive(Clone)]
struct AccessTokenChecker {
    jwt_access_secret: String,
}

pub fn new_access_token_checker(jwt_access_secret: String) -> DynJwtSecurityCheck {
    Arc::new(Box::new(AccessTokenChecker { jwt_access_secret }))
}

impl JwtSecurityCheck for AccessTokenChecker {
    fn check_security(
        &self,
        security: &HttpSecurity,
        auth_header: Option<&str>,
    ) -> HandlerResult<Option<jwt::AccessClaims>> {
        // Get the claims from the auth header, if there is one.
        //
        // A token that fails to decode is only fatal for endpoints that
        // actually require one. On a public endpoint a malformed, expired or
        // non-Bearer credential is treated as anonymous, so that a client
        // holding a stale token can still reach login/refresh/logout.
        let claims = match auth_header {
            None => None,
            Some(ah) => match claims_from_bearer_token(&self.jwt_access_secret, ah) {
                Ok(claims) => Some(claims),
                Err(e) => match security {
                    HttpSecurity::Public => None,
                    HttpSecurity::Token | HttpSecurity::TokenWithRole(_) => return Err(e),
                },
            },
        };

        // Check whether the claims match the endpoints security rules.
        // Missing or unusable credentials are a 401; credentials carrying the
        // wrong role are a 403.
        match security {
            HttpSecurity::Public => Ok(claims),
            HttpSecurity::Token => {
                if claims.is_some() {
                    Ok(claims)
                } else {
                    log::warn!("request without jwt claims to a token endpoint");
                    Err(unauthorized())
                }
            }
            HttpSecurity::TokenWithRole(role) => match claims.as_ref().map(|c| c.role == *role) {
                None => {
                    log::warn!("request without jwt claims to a role restricted endpoint");
                    Err(unauthorized())
                }
                Some(true) => Ok(claims),
                Some(false) => {
                    log::warn!("request with insufficient role, {} required", role);
                    Err(forbidden())
                }
            },
        }
    }
}

fn claims_from_bearer_token(
    jwt_secret: &str,
    auth_header: &str,
) -> HandlerResult<jwt::AccessClaims> {
    let jwt = jwt::bearer_token_from_auth_header(auth_header).ok_or(unauthorized())?;
    let claims = jwt::decode_access(jwt_secret, &jwt).map_err(|e| {
        // Not necessarily an error: on a public endpoint the caller is just
        // treated as anonymous. check_security logs the cases that are fatal.
        log::debug!("failed to validate jwt: {}", e);
        unauthorized()
    })?;
    Ok(claims)
}

pub fn forbidden() -> HandlerError {
    HandlerError::Poem(poem::Error::from_status(StatusCode::FORBIDDEN))
}

pub fn unauthorized() -> HandlerError {
    HandlerError::Poem(poem::Error::from_status(StatusCode::UNAUTHORIZED))
}

//---------------------------------------------------------------------------

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

impl From<HandlerError> for poem::Error {
    fn from(err: HandlerError) -> poem::Error {
        match err {
            HandlerError::Anyhow(_) => poem::Error::from_status(StatusCode::INTERNAL_SERVER_ERROR),
            HandlerError::Poem(e) => e,
        }
    }
}

//---------------------------------------------------------------------------

/// Builder for the server's poem routes.
///
/// Wraps a poem endpoint so that ADL APIs, hand written endpoints, shared data
/// and middleware are all added in one chain. Implementing [`Mount`] is what
/// lets a generated `register` mount an entire API straight into it.
///
/// It is generic over what it holds because poem's `data` and `with` return a
/// new endpoint type rather than a `Route`: routes can only be added while it
/// still wraps a `Route`, which the type system enforces.
pub struct PoemRoutes<E = Route>(E);

impl Default for PoemRoutes<Route> {
    fn default() -> Self {
        PoemRoutes(Route::new())
    }
}

impl PoemRoutes<Route> {
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a hand written endpoint at `path`.
    pub fn at<EP>(self, path: impl AsRef<str>, ep: EP) -> Self
    where
        EP: IntoEndpoint,
        EP::Endpoint: 'static,
    {
        PoemRoutes(self.0.at(path, ep))
    }

    /// Mount every endpoint of an ADL API, as declared in its ADL struct.
    ///
    /// Generic over the API, so any `#[derive(HttpApi)]` struct can be mounted
    /// without further code here.
    pub fn adl_api_at<A, H>(self, api: &A, handlers: Arc<H>) -> Self
    where
        A: Api<AdlReqContext<AppState>, Self, H>,
    {
        api.register(self, handlers)
    }
}

impl<E: Endpoint> PoemRoutes<E> {
    /// Make a value available to every endpoint via `Request::data`.
    pub fn data<T>(self, data: T) -> PoemRoutes<impl Endpoint>
    where
        T: Clone + Send + Sync + 'static,
    {
        PoemRoutes(self.0.data(data))
    }

    /// Wrap every endpoint in a poem middleware.
    pub fn with<M>(self, middleware: M) -> PoemRoutes<M::Output>
    where
        M: Middleware<E>,
    {
        PoemRoutes(self.0.with(middleware))
    }

    /// Erase the endpoint type, for handing to `poem::Server::run`.
    pub fn into_dyn_endpoint(self) -> ToDynEndpoint<E> {
        ToDynEndpoint(self.0)
    }
}

impl Mount<AdlReqContext<AppState>> for PoemRoutes<Route> {
    type Error = HandlerError;

    fn mount<I, O>(
        self,
        req: &HttpReq<I, O>,
        handler: Handler<AdlReqContext<AppState>, I, O, Self::Error>,
    ) -> Self
    where
        I: serde::de::DeserializeOwned + Send + Sync + 'static,
        O: serde::Serialize + Send + Sync + 'static,
    {
        PoemRoutes(self.0.adl_dyn_req(req, handler))
    }
}
