use poem::http::StatusCode;
use poem::web::Json;
use poem::RequestBody;
use poem::{Endpoint, FromRequest, IntoResponse, Request, Response, Route};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::future::Future;
use std::marker::PhantomData;
use std::sync::Arc;

use crate::adl::gen::common::http::HttpSecurity;
use crate::adl::gen::common::http::{HttpGet, HttpPost};

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
     * Add a handler for an ADL specified HttpPost endpoint
     */
    fn adl_post<S, I, O, FO>(self, req: HttpPost<I, O>, f: fn(AdlReqContext<S>, I) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static;

    /**
     * Add a handler for an ADL specified HttpGet endpoint
     */
    fn adl_get<S, O, FO>(self, req: HttpGet<O>, f: fn(AdlReqContext<S>) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static;
}

impl RouteExt for Route {
    fn adl_post<S, I, O, FO>(self, req: HttpPost<I, O>, f: fn(AdlReqContext<S>, I) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static,
    {
        let endpoint = AdlPost {
            req,
            handler: f,
            phantom: PhantomData,
        };
        self.at(endpoint.req.path.clone(), endpoint)
    }

    fn adl_get<S, O, FO>(self, req: HttpGet<O>, f: fn(AdlReqContext<S>) -> FO) -> Self
    where
        S: Send + Sync + Clone + 'static,
        O: Send + Sync + Serialize + 'static,
        FO: Future<Output = HandlerResult<O>> + Send + 'static,
    {
        let endpoint = AdlGet {
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

pub struct AdlPost<S, I, O, FO> {
    req: HttpPost<I, O>,
    handler: fn(AdlReqContext<S>, I) -> FO,
    phantom: PhantomData<S>,
}

impl<S, I, O, FO> Endpoint for AdlPost<S, I, O, FO>
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
        let i: Json<I> = Json::from_request(&req, &mut body).await?;
        let o = (self.handler)(ctx, i.0).await?;
        Ok(Json(o).into_response())
    }
}

//---------------------------------------------------------------------------

pub struct AdlGet<S, O, FO> {
    req: HttpGet<O>,
    handler: fn(AdlReqContext<S>) -> FO,
    phantom: PhantomData<S>,
}

impl<S, O, FO> Endpoint for AdlGet<S, O, FO>
where
    S: Send + Sync + Clone + 'static,
    O: Send + Sync + Serialize + 'static,
    FO: Future<Output = HandlerResult<O>> + Send,
{
    type Output = Response;
    async fn call(&self, req: Request) -> poem::Result<Self::Output> {
        let ctx = get_adl_request_context(&req, &self.req.security)?;
        let o = (self.handler)(ctx).await?;
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
        // Get the claims from the auth header, if there is one
        let claims = match auth_header {
            Some(ah) => Some(claims_from_bearer_token(&self.jwt_access_secret, ah)?),
            None => None,
        };

        // Check whether the claims match the endpoints security rules
        let request_allowed = match security {
            HttpSecurity::Public => true,
            HttpSecurity::Token => claims.is_some(),
            HttpSecurity::TokenWithRole(role) => {
                if let Some(claims) = &claims {
                    claims.role == *role
                } else {
                    false
                }
            }
        };

        if request_allowed {
            Ok(claims)
        } else {
            log::error!("request without valid jwt claims");
            Err(forbidden())
        }
    }
}

fn claims_from_bearer_token(
    jwt_secret: &str,
    auth_header: &str,
) -> HandlerResult<jwt::AccessClaims> {
    let jwt = jwt::bearer_token_from_auth_header(auth_header).ok_or(forbidden())?;
    let claims = jwt::decode_access(jwt_secret, &jwt).map_err(|e| {
        log::error!("failed to validate jwt: {}", e);
        forbidden()
    })?;
    Ok(claims)
}

pub fn forbidden() -> HandlerError {
    HandlerError::Poem(poem::Error::from_status(StatusCode::FORBIDDEN))
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
