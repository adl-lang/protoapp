// @generated from adl module common.capability

use crate::adl::gen::common::http::HttpRateLimit;
use serde::Deserialize;
use serde::Serialize;

/**
 * Used to create a field inside an API struct which represents a section of the api requiring a token.
 * C is the type of the client-side token
 * S is the type of the server-side capability
 * V is the type of the API struct requiring the capability
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct CapabilityApi<C, S, V> {
  #[serde(default="CapabilityApi::<C, S, V>::def_token")]
  pub token: std::marker::PhantomData<C>,

  #[serde(default="CapabilityApi::<C, S, V>::def_cap")]
  pub cap: std::marker::PhantomData<S>,

  #[serde(default="CapabilityApi::<C, S, V>::def_service_prefix")]
  pub service_prefix: String,

  pub service: V,

  #[serde(default="CapabilityApi::<C, S, V>::def_name")]
  pub name: String,
}

impl<C, S, V> CapabilityApi<C, S, V> {
  pub fn new(service: V) -> CapabilityApi<C, S, V> {
    CapabilityApi {
      token: CapabilityApi::<C, S, V>::def_token(),
      cap: CapabilityApi::<C, S, V>::def_cap(),
      service_prefix: CapabilityApi::<C, S, V>::def_service_prefix(),
      service: service,
      name: CapabilityApi::<C, S, V>::def_name(),
    }
  }

  pub fn def_token() -> std::marker::PhantomData<C> {
    std::marker::PhantomData
  }

  pub fn def_cap() -> std::marker::PhantomData<S> {
    std::marker::PhantomData
  }

  pub fn def_service_prefix() -> String {
    "".to_string()
  }

  pub fn def_name() -> String {
    "".to_string()
  }
}

/**
 * Used to annotation resp struct of branch of resp union which creates a cap.
 * more accurately, since generic types can be used as annotation type, used to create a type alias which is used as the annotation.
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct CapabilityToken<S> {
  #[serde(default="CapabilityToken::<S>::def_cap")]
  pub cap: std::marker::PhantomData<S>,
}

impl<S> CapabilityToken<S> {
  pub fn new() -> CapabilityToken<S> {
    CapabilityToken {
      cap: CapabilityToken::<S>::def_cap(),
    }
  }

  pub fn def_cap() -> std::marker::PhantomData<S> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpGet<O> {
  pub path: String,

  #[serde(default="HttpGet::<O>::def_rate_limit")]
  #[serde(rename="rateLimit")]
  pub rate_limit: Option<HttpRateLimit>,

  #[serde(default="HttpGet::<O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<O> HttpGet<O> {
  pub fn new(path: String) -> HttpGet<O> {
    HttpGet {
      path: path,
      rate_limit: HttpGet::<O>::def_rate_limit(),
      resp_type: HttpGet::<O>::def_resp_type(),
    }
  }

  pub fn def_rate_limit() -> Option<HttpRateLimit> {
    None
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpPost<I, O> {
  pub path: String,

  #[serde(default="HttpPost::<I, O>::def_rate_limit")]
  #[serde(rename="rateLimit")]
  pub rate_limit: Option<HttpRateLimit>,

  #[serde(default="HttpPost::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpPost::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpPost<I, O> {
  pub fn new(path: String) -> HttpPost<I, O> {
    HttpPost {
      path: path,
      rate_limit: HttpPost::<I, O>::def_rate_limit(),
      req_type: HttpPost::<I, O>::def_req_type(),
      resp_type: HttpPost::<I, O>::def_resp_type(),
    }
  }

  pub fn def_rate_limit() -> Option<HttpRateLimit> {
    None
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}
