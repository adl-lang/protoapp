use poem::http::StatusCode;
use poem::web::Json;
use poem::{Endpoint, FromRequest, IntoResponse, Request, Response, Route};
use poem::{RequestBody, RouteMethod};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::marker::PhantomData;
use std::sync::Arc;

use crate::adl::gen::common::http::HttpPost;
use crate::adl::gen::common::http::HttpSecurity;

use super::jwt;

/**
 * Contextual information available to ADL request handlers
 */
pub struct AdlReqContext<S> {
    state: S,
    claims: Option<jwt::AccessClaims>,
}

/**
 *  Result type for ADL request handlers
 */
pub type AdlResult<T> = poem::Result<T>;

trait HasRouteMethod {
    fn route(self) -> (String, RouteMethod);
}

pub trait RouteExt {
    /**
     * Add a handler for an ADL specified HttpPost endpoint
     */
    fn adl_post<S, F, I, O>(self, req: HttpPost<I, O>, f: F) -> Self
    where
        S: Send + Sync + Clone + 'static,
        F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static;
}

impl RouteExt for Route {
    fn adl_post<S, F, I, O>(self, req: HttpPost<I, O>, f: F) -> Self
    where
        S: Send + Sync + Clone + 'static,
        F: Fn(AdlReqContext<S>, I) -> AdlResult<O> + Send + Sync + 'static,
        I: Send + Sync + DeserializeOwned + 'static,
        O: Send + Sync + Serialize + 'static,
    {
        let endpoint = AdlPost {
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
    ) -> AdlResult<Option<jwt::AccessClaims>>;
}

pub type DynJwtSecurityCheck = Arc<Box<dyn JwtSecurityCheck + Send + Sync>>;

//---------------------------------------------------------------------------

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
            .data::<DynJwtSecurityCheck>()
            .expect("JwtChecker should be configured");
        let state = req.data::<S>().expect("State should be configured").clone();
        let auth_header = req.header("Authorization");
        let claims = jwt_checker.check_security(&self.req.security, auth_header)?;
        let mut body = RequestBody::new(req.take_body());
        let i: Json<I> = Json::from_request(&req, &mut body).await?;
        let ctx = AdlReqContext { state, claims };
        let o: O = (self.handler)(ctx, i.0)?;
        Ok(Json(o).into_response())
    }
}

#[derive(Clone)]
struct AccessTokenCheck {
    jwt_access_secret: String,
}

pub fn new_access_token_check(jwt_access_secret: String) -> DynJwtSecurityCheck {
    Arc::new(Box::new(AccessTokenCheck { jwt_access_secret }))
}

impl JwtSecurityCheck for AccessTokenCheck {
    fn check_security(
        &self,
        security: &HttpSecurity,
        auth_header: Option<&str>,
    ) -> AdlResult<Option<jwt::AccessClaims>> {
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
            Err(forbidden())
        }
    }
}

fn claims_from_bearer_token(
    jwt_secret: &str,
    auth_header: &str,
) -> poem::Result<jwt::AccessClaims> {
    let jwt = jwt::bearer_token_from_auth_header(auth_header).ok_or(forbidden())?;
    let claims = jwt::decode_access(jwt_secret, &jwt).map_err(|e| {
        log::error!("failed to validate jwt: {}", e);
        forbidden()
    })?;
    return Ok(claims);
}

fn forbidden() -> poem::Error {
    poem::Error::from_status(StatusCode::FORBIDDEN)
}
