// @generated from adl module protoapp.apis.ui

use crate::adl::gen::common::http::HttpGet;
use crate::adl::gen::common::http::HttpPost;
use crate::adl::gen::common::http::HttpSecurity;
use crate::adl::gen::common::http::Unit;
use crate::adl::gen::protoapp::apis::types::LoginReq;
use crate::adl::gen::protoapp::apis::types::LoginResp;
use crate::adl::gen::protoapp::apis::types::Message;
use crate::adl::gen::protoapp::apis::types::NewMessageReq;
use crate::adl::gen::protoapp::apis::types::Paginated;
use crate::adl::gen::protoapp::apis::types::QueryUsersReq;
use crate::adl::gen::protoapp::apis::types::RecentMessagesReq;
use crate::adl::gen::protoapp::apis::types::RefreshReq;
use crate::adl::gen::protoapp::apis::types::RefreshResp;
use crate::adl::gen::protoapp::apis::types::UserDetails;
use crate::adl::gen::protoapp::apis::types::UserWithId;
use crate::adl::gen::protoapp::apis::types::WithId;
use crate::adl::gen::protoapp::db::AppUserId;
use crate::adl::gen::protoapp::db::MessageId;
use serde::Deserialize;
use serde::Serialize;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct ApiRequests {
  /**
   * AWS default compatible health check
   */
  #[serde(default="ApiRequests::def_healthy")]
  pub healthy: HttpGet<Unit>,

  /**
   * Test the server is live
   */
  #[serde(default="ApiRequests::def_ping")]
  pub ping: HttpPost<Unit, Unit>,

  /**
   * Login a user
   * The response will set an httpOnly cookie containing the refresh token
   */
  #[serde(default="ApiRequests::def_login")]
  pub login: HttpPost<LoginReq, LoginResp>,

  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refrestToken cookie in the request.
   */
  #[serde(default="ApiRequests::def_refresh")]
  pub refresh: HttpPost<RefreshReq, RefreshResp>,

  /**
   * Clear the `refreshToken` cookie.
   */
  #[serde(default="ApiRequests::def_logout")]
  pub logout: HttpPost<Unit, Unit>,

  /**
   * Post a message to the noticeboard
   */
  #[serde(default="ApiRequests::def_new_message")]
  pub new_message: HttpPost<NewMessageReq, MessageId>,

  /**
   * Get recent noticeboard messages
   */
  #[serde(default="ApiRequests::def_recent_messages")]
  pub recent_messages: HttpPost<RecentMessagesReq, Paginated<Message>>,

  /**
   * Gets info about the logged in user
   */
  #[serde(default="ApiRequests::def_who_am_i")]
  pub who_am_i: HttpGet<UserWithId>,

  /**
   * Create a new user
   */
  #[serde(default="ApiRequests::def_create_user")]
  pub create_user: HttpPost<UserDetails, AppUserId>,

  /**
   * Update a user
   */
  #[serde(default="ApiRequests::def_update_user")]
  pub update_user: HttpPost<WithId<AppUserId, UserDetails>, Unit>,

  /**
   * Query users
   */
  #[serde(default="ApiRequests::def_query_users")]
  pub query_users: HttpPost<QueryUsersReq, Paginated<UserWithId>>,

  #[serde(default="ApiRequests::def_message_api")]
  pub message_api: MessageApi,
}

impl ApiRequests {
  pub fn new() -> ApiRequests {
    ApiRequests {
      healthy: ApiRequests::def_healthy(),
      ping: ApiRequests::def_ping(),
      login: ApiRequests::def_login(),
      refresh: ApiRequests::def_refresh(),
      logout: ApiRequests::def_logout(),
      new_message: ApiRequests::def_new_message(),
      recent_messages: ApiRequests::def_recent_messages(),
      who_am_i: ApiRequests::def_who_am_i(),
      create_user: ApiRequests::def_create_user(),
      update_user: ApiRequests::def_update_user(),
      query_users: ApiRequests::def_query_users(),
      message_api: ApiRequests::def_message_api(),
    }
  }

  pub fn def_healthy() -> HttpGet<Unit> {
    HttpGet::<Unit>{path : "/".to_string(), security : HttpSecurity::Public, rate_limit : None, resp_type : std::marker::PhantomData}
  }

  pub fn def_ping() -> HttpPost<Unit, Unit> {
    HttpPost::<Unit, Unit>{path : "/ping".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_login() -> HttpPost<LoginReq, LoginResp> {
    HttpPost::<LoginReq, LoginResp>{path : "/login".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_refresh() -> HttpPost<RefreshReq, RefreshResp> {
    HttpPost::<RefreshReq, RefreshResp>{path : "/refresh".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_logout() -> HttpPost<Unit, Unit> {
    HttpPost::<Unit, Unit>{path : "/logout".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_new_message() -> HttpPost<NewMessageReq, MessageId> {
    HttpPost::<NewMessageReq, MessageId>{path : "/messages/new".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_recent_messages() -> HttpPost<RecentMessagesReq, Paginated<Message>> {
    HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_who_am_i() -> HttpGet<UserWithId> {
    HttpGet::<UserWithId>{path : "/whoami".to_string(), security : HttpSecurity::Token, rate_limit : None, resp_type : std::marker::PhantomData}
  }

  pub fn def_create_user() -> HttpPost<UserDetails, AppUserId> {
    HttpPost::<UserDetails, AppUserId>{path : "/users/create".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_update_user() -> HttpPost<WithId<AppUserId, UserDetails>, Unit> {
    HttpPost::<WithId<AppUserId, UserDetails>, Unit>{path : "/users/update".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_query_users() -> HttpPost<QueryUsersReq, Paginated<UserWithId>> {
    HttpPost::<QueryUsersReq, Paginated<UserWithId>>{path : "/users/query".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_message_api() -> MessageApi {
    MessageApi{new_message : HttpPost::<NewMessageReq, MessageId>{path : "/messages/new".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}, recent_messages : HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}}
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct MessageApi {
  /**
   * Post a message to the noticeboard
   */
  #[serde(default="MessageApi::def_new_message")]
  pub new_message: HttpPost<NewMessageReq, MessageId>,

  /**
   * Get recent noticeboard messages
   */
  #[serde(default="MessageApi::def_recent_messages")]
  pub recent_messages: HttpPost<RecentMessagesReq, Paginated<Message>>,
}

impl MessageApi {
  pub fn new() -> MessageApi {
    MessageApi {
      new_message: MessageApi::def_new_message(),
      recent_messages: MessageApi::def_recent_messages(),
    }
  }

  pub fn def_new_message() -> HttpPost<NewMessageReq, MessageId> {
    HttpPost::<NewMessageReq, MessageId>{path : "/messages/new".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_recent_messages() -> HttpPost<RecentMessagesReq, Paginated<Message>> {
    HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }
}
