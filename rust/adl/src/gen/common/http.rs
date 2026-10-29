// @generated from adl module common.http

use serde::Deserialize;
use serde::Serialize;

/**
 * Request types
 * An API is a struct whose fields are HttpReq values. Everything about an
 * endpoint other than its request and response types is an annotation on the
 * field rather than a value in this struct: the http path, the method and the
 * security policy. Those are facts about the declaration, so every backend
 * that consumes an API can read them from the ADL itself, and the rust
 * `HttpApi` derive can read them at macro expansion time and vary the code it
 * generates. Every backend must agree on them: the rust server, the
 * typescript client and the api workbench.
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct HttpReq<I, O> {
  #[serde(default="HttpReq::<I, O>::def_req_type")]
  #[serde(rename="reqType")]
  pub req_type: std::marker::PhantomData<I>,

  #[serde(default="HttpReq::<I, O>::def_resp_type")]
  #[serde(rename="respType")]
  pub resp_type: std::marker::PhantomData<O>,
}

impl<I, O> HttpReq<I, O> {
  pub fn new() -> HttpReq<I, O> {
    HttpReq {
      req_type: HttpReq::<I, O>::def_req_type(),
      resp_type: HttpReq::<I, O>::def_resp_type(),
    }
  }

  pub fn def_req_type() -> std::marker::PhantomData<I> {
    std::marker::PhantomData
  }

  pub fn def_resp_type() -> std::marker::PhantomData<O> {
    std::marker::PhantomData
  }
}

/**
 * The http method of an endpoint, as an annotation on the HttpReq field:
 *     @HttpMethod "get"
 *     HttpReq<RecentMessagesReq, Paginated<Message>> recent_messages = {};
 * Annotating the api struct instead sets the default for all of its own
 * endpoints, which a field annotation then overrides. The default does not
 * reach a nested api: that is a separate declaration, and one that may be
 * nested at more than one field, so what it means cannot depend on where it
 * is mounted.
 * Requests are post when neither annotation is present. If a given request:
 *     - is side-effect free
 *     - has a body I small enough to fit encoded in the URI
 * one can set the method to "get", eg to allow CDN caching etc.
 */
#[derive(Clone,Debug,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum HttpMethod {
  #[serde(rename="get")]
  Get,

  #[serde(rename="post")]
  Post,
}

/**
 * The security policy of an endpoint, as an annotation on the HttpReq field:
 *     @HttpSecurity "token"
 *     HttpReq<NewMessageReq, MessageId> new_message = {};
 *     @HttpSecurity { "tokenWithRole": "admin" }
 *     HttpReq<UserDetails, AppUserId> create_user = {};
 * Annotating the api struct instead sets the policy for all of its own
 * endpoints, which a field annotation then overrides. An api whose whole
 * surface shares a policy says so once rather than repeating it, and in the
 * tokenWithRole case that also means the role name appears once. As with the
 * method, the default does not reach a nested api.
 * Beyond that there is no default. An endpoint that resolves to no policy is
 * an error, not a public endpoint: a policy that silently fell back to
 * "public" would be the worst possible failure mode. The rust `HttpApi`
 * derive refuses to compile such a declaration, and the typescript endpoint
 * walk throws.
 */
#[derive(Clone,Debug,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum HttpSecurity {
  #[serde(rename="public")]
  Public,

  #[serde(rename="token")]
  Token,

  #[serde(rename="tokenWithRole")]
  TokenWithRole(String),
}

/**
 * Overrides the HTTP path of an endpoint, which otherwise derives from the
 * field name as "/" ++ the field name.
 * Annotate the HttpReq field, not its type:
 *     @HttpPath "/"
 *     HttpReq<Void,Void> healthy = {};
 * The value is used verbatim, so it carries its own leading slash. This is
 * the only way to reach a path an ADL field name cannot spell, such as the
 * root path, a kebab cased one, or one with more than one segment, and the
 * way to pin a path that something outside the application dictates.
 */
pub type HttpPath = String;

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
