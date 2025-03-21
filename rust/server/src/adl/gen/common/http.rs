// @generated from adl module common.http

use serde::Deserialize;
use serde::Serialize;

/**
 * Request types
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpGet<I, O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpGet::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpGet::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpGet<I, O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpGet<I, O> {
    HttpGet {
      path: path,
      security: security,
      req_type: HttpGet::<I, O>::def_req_type(),
      resp_type: HttpGet::<I, O>::def_resp_type(),
    }
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpPost<I, O> {
  pub path: String,

  pub security: HttpSecurity,

  #[serde(default="HttpPost::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpPost::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpPost<I, O> {
  pub fn new(path: String, security: HttpSecurity) -> HttpPost<I, O> {
    HttpPost {
      path: path,
      security: security,
      req_type: HttpPost::<I, O>::def_req_type(),
      resp_type: HttpPost::<I, O>::def_resp_type(),
    }
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
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
