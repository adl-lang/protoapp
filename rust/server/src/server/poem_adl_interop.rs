use poem::error::ParseJsonError;
use poem::http::StatusCode;
use poem::web::Json;
use poem::RequestBody;
use poem::{Endpoint, FromRequest, IntoResponse, Request, Response, Route};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::future::Future;
use std::marker::PhantomData;
use std::sync::Arc;

use adl::gen::common::http::{HttpMethod, HttpReq, HttpSecurity};

use super::jwt;

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

pub trait RouteExt {
    /**
     * Add a handler for an ADL specified HttpReq endpoint
     */
    fn adl_req<S, I, O, FO>(self, req: HttpReq<I, O>, f: fn(AdlReqContext<S>, I) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static;
}

impl RouteExt for Route {
    fn adl_req<S, I, O, FO>(self, req: HttpReq<I, O>, f: fn(AdlReqContext<S>, I) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static,
    {
        let endpoint = AdlReq {
            req,
            handler: f,
            phantom: PhantomData,
        };
        self.at(endpoint.req.path.clone(), endpoint)
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

pub struct AdlReq<S, I, O, FO> {
    req: HttpReq<I, O>,
    handler: fn(AdlReqContext<S>, I) -> FO,
    phantom: PhantomData<S>,
}

impl<S, I, O, FO> AdlReq<S, I, O, FO>
where
    S: Send + Sync + Clone + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
    FO: Future<Output = HandlerResult<O>> + Send,
{
    // Here we implement the query string -> ADL value transform. The rules are
    //    if I is Void, we allow no query string
    //    otherwise we expect a query string of form
    //
    //      input=${encodeURIComponent(serde_json::to_string(i))}
    //
    fn decode_query_string(req: Request) -> poem::Result<I> {
        let query_str = req.uri().query();
        match query_str {
            None => {
                let i = serde_json::from_value(serde_json::Value::Null)
                    .map_err(ParseJsonError::Parse)?;
                Ok(i)
            }
            Some(_) => {
                let params: Params = req.params()?;
                let i = serde_json::from_str(&params.input).map_err(ParseJsonError::Parse)?;
                Ok(i)
            }
        }
    }
}

#[derive(Deserialize)]
struct Params {
    input: String,
}

impl<S, I, O, FO> Endpoint for AdlReq<S, I, O, FO>
where
    S: Send + Sync + Clone + 'static,
    I: Send + Sync + DeserializeOwned + 'static,
    O: Send + Sync + Serialize + 'static,
    FO: Future<Output = HandlerResult<O>> + Send,
{
    type Output = Response;
    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let mut body = RequestBody::new(req.take_body());
        let ctx = get_adl_request_context(&req, &self.req.security)?;
        let i: I = match self.req.method {
            HttpMethod::Get => Self::decode_query_string(req)?,
            HttpMethod::Post => Json::from_request(&req, &mut body).await?.0,
        };
        let o = (self.handler)(ctx, i).await?;
        Ok(Json(o).into_response())
    }
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
