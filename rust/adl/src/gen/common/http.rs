// @generated from adl module common.http

use serde::Deserialize;
use serde::Serialize;

/**
 * Request types
 * An API is a struct whose fields are HttpReq values. The HTTP path of each
 * endpoint is derived from its field name, as "/" ++ the field name, and must
 * be derived identically by every backend that consumes an API: the rust
 * server, the typescript client and the api workbench.
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpReq<I, O> {
  #[serde(default="HttpReq::<I, O>::def_method")]
  pub method: HttpMethod,

  pub security: HttpSecurity,

  #[serde(default="HttpReq::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpReq::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpReq<I, O> {
  pub fn new(security: HttpSecurity) -> HttpReq<I, O> {
    HttpReq {
      method: HttpReq::<I, O>::def_method(),
      security: security,
      req_type: HttpReq::<I, O>::def_req_type(),
      resp_type: HttpReq::<I, O>::def_resp_type(),
    }
  }

  pub fn def_method() -> HttpMethod {
    HttpMethod::Post
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum HttpMethod {
  #[serde(rename="get")]
  Get,

  #[serde(rename="post")]
  Post,
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum HttpSecurity {
  #[serde(rename="public")]
  Public,

  #[serde(rename="token")]
  Token,

  #[serde(rename="tokenWithRole")]
  TokenWithRole(String),
}

/**
 * Empty Struct (Used mostly for Void RPC responses)
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Unit {
}

impl Unit {
  pub fn new() -> Unit {
    Unit {
    }
  }
}
