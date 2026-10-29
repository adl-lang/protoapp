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

use adl::gen::common::http::{HttpMethod, HttpSecurity};
use adl::http_api::{Handler, HttpApi, Mount, SecuredHandler};

use super::jwt;
use super::AppState;

/**
 * Contextual information available to ADL request handlers
 *
 * The caller's identity used to live here, as `Option<AccessClaims>`, which
 * left every handler to decide whether to check it. It is now a separate
 * argument, present only on the endpoints whose policy requires one and
 * already checked against that policy, so this carries nothing but the state.
 * Design doc item 2 can collapse it into the state outright.
 */
pub struct AdlReqContext<S> {
    pub state: S,
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
        path: &str,
        method: HttpMethod,
        handler: adl::http_api::Handler<AdlReqContext<S>, I, O, HandlerError>,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static;

    fn adl_dyn_secured_req<S, I, O>(
        self,
        path: &str,
        method: HttpMethod,
        security: &HttpSecurity,
        handler: adl::http_api::SecuredHandler<
            AdlReqContext<S>,
            jwt::AccessClaims,
            I,
            O,
            HandlerError,
        >,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static;
}

impl DynRouteExt for Route {
    fn adl_dyn_req<S, I, O>(
        self,
        path: &str,
        method: HttpMethod,
        handler: adl::http_api::Handler<AdlReqContext<S>, I, O, HandlerError>,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
    {
        self.at(path, AdlDynReq { method, handler })
    }

    fn adl_dyn_secured_req<S, I, O>(
        self,
        path: &str,
        method: HttpMethod,
        security: &HttpSecurity,
        handler: adl::http_api::SecuredHandler<
            AdlReqContext<S>,
            jwt::AccessClaims,
            I,
            O,
            HandlerError,
        >,
    ) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
    {
        self.at(
            path,
            AdlDynSecuredReq {
                method,
                security: security.clone(),
                handler,
            },
        )
    }
}

struct AdlDynReq<S, I, O> {
    method: HttpMethod,
    handler: adl::http_api::Handler<AdlReqContext<S>, I, O, HandlerError>,
}

struct AdlDynSecuredReq<S, I, O> {
    method: HttpMethod,
    security: HttpSecurity,
    handler: adl::http_api::SecuredHandler<AdlReqContext<S>, jwt::AccessClaims, I, O, HandlerError>,
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
        let ctx = get_adl_request_context(&req);
        let i: I = decode_request(&req, &mut body, self.method.clone()).await?;
        let o = (self.handler)(ctx, i).await?;
        Ok(Json(o).into_response())
    }
}

impl<S, I, O> Endpoint for AdlDynSecuredReq<S, I, O>
where
    S: Send + Sync + Clone + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
{
    type Output = Response;
    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let mut body = RequestBody::new(req.take_body());
        // Before the body is even decoded, and before the handler exists as a
        // possibility: the handler takes an identity, and this is the only
        // place one is made.
        let identity = authenticate(&req, &self.security)?;
        let ctx = get_adl_request_context(&req);
        let i: I = decode_request(&req, &mut body, self.method.clone()).await?;
        let o = (self.handler)(ctx, identity, i).await?;
        Ok(Json(o).into_response())
    }
}

/// Decode the request body, from the query string for a get and the json body
/// for a post.
async fn decode_request<I: DeserializeOwned>(
    req: &Request,
    body: &mut RequestBody,
    method: HttpMethod,
) -> poem::Result<I> {
    match method {
        HttpMethod::Get => decode_query_string(req),
        HttpMethod::Post => Ok(Json::from_request(req, body).await?.0),
    }
}

pub trait JwtSecurityCheck {
    /// Check a non-public endpoint's policy against the request's credential,
    /// and return the identity it authenticates.
    ///
    /// There is no `Option` in the result: every policy this is called for
    /// requires a credential, so a missing or unusable one is an error rather
    /// than an anonymous caller. A `public` endpoint does not call this at
    /// all.
    fn check_security(
        &self,
        security: &HttpSecurity,
        auth_header: Option<&str>,
    ) -> HandlerResult<jwt::AccessClaims>;
}

pub type DynJwtSecurityCheck = Arc<Box<dyn JwtSecurityCheck + Send + Sync>>;

//---------------------------------------------------------------------------

// Here we implement the query string -> ADL value transform. The rules are
//    if I is Void, we allow no query string
//    otherwise we expect a query string of form
//
//      input=${encodeURIComponent(serde_json::to_string(i))}
//
fn decode_query_string<I: DeserializeOwned>(req: &Request) -> poem::Result<I> {
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
) -> AdlReqContext<S> {
    let state = req.data::<S>().expect("State should be configured").clone();
    AdlReqContext { state }
}

/// Authenticate a request against a non-public endpoint's policy, yielding the
/// caller's identity.
///
/// The only way to obtain an identity, and so the only way to reach a handler
/// that takes one. An endpoint whose policy is `public` never calls this: a
/// credential on such a request is ignored entirely, which is what lets a
/// client holding a stale token still reach login, refresh and logout.
pub fn authenticate(
    req: &poem::Request,
    security: &HttpSecurity,
) -> HandlerResult<jwt::AccessClaims> {
    let jwt_checker = req
        .data::<DynJwtSecurityCheck>()
        .expect("JwtChecker should be configured");
    jwt_checker.check_security(security, req.header("Authorization"))
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
    ) -> HandlerResult<jwt::AccessClaims> {
        // Missing or unusable credentials are a 401; credentials carrying the
        // wrong role are a 403. A public endpoint never reaches here, so a
        // credential that fails to decode is always fatal: the caller cannot
        // fall back to being anonymous on an endpoint that requires a token.
        let Some(auth_header) = auth_header else {
            log::warn!("request without a credential to a {security:?} endpoint");
            return Err(unauthorized());
        };
        let claims = claims_from_bearer_token(&self.jwt_access_secret, auth_header)?;
        match security {
            HttpSecurity::Public => {
                // Unreachable by construction: `authenticate` is called only
                // from a secured mount. Treated as a programming error rather
                // than silently granted.
                log::error!("a public endpoint reached the authenticated path");
                Err(forbidden())
            }
            HttpSecurity::Token => Ok(claims),
            HttpSecurity::TokenWithRole(role) => {
                if claims.role == *role {
                    Ok(claims)
                } else {
                    log::warn!("request with insufficient role, {} required", role);
                    Err(forbidden())
                }
            }
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
        A: HttpApi<AdlReqContext<AppState>, Self, H>,
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
    type Identity = jwt::AccessClaims;

    fn mount_public<I, O>(
        self,
        path: &str,
        method: HttpMethod,
        handler: Handler<AdlReqContext<AppState>, I, O, Self::Error>,
    ) -> Self
    where
        I: serde::de::DeserializeOwned + Send + Sync + 'static,
        O: serde::Serialize + Send + Sync + 'static,
    {
        PoemRoutes(self.0.adl_dyn_req(path, method, handler))
    }

    fn mount_secured<I, O>(
        self,
        path: &str,
        method: HttpMethod,
        security: &HttpSecurity,
        handler: SecuredHandler<AdlReqContext<AppState>, Self::Identity, I, O, Self::Error>,
    ) -> Self
    where
        I: serde::de::DeserializeOwned + Send + Sync + 'static,
        O: serde::Serialize + Send + Sync + 'static,
    {
        PoemRoutes(self.0.adl_dyn_secured_req(path, method, security, handler))
    }
}
