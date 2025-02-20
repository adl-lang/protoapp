// @generated from adl module protoapp.apis.ui

use crate::adl::custom::common::time::Instant;
use crate::adl::gen::common::http::HttpGet;
use crate::adl::gen::common::http::HttpPost;
use crate::adl::gen::common::http::HttpSecurity;
use crate::adl::gen::common::http::Unit;
use crate::adl::gen::common::strings::EmailAddress;
use crate::adl::gen::common::strings::Password;
use crate::adl::gen::common::strings::StringML;
use crate::adl::gen::common::strings::StringNE;
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

  #[serde(default="ApiRequests::def_messages")]
  pub messages: MessageApi,

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
      messages: ApiRequests::def_messages(),
      who_am_i: ApiRequests::def_who_am_i(),
      create_user: ApiRequests::def_create_user(),
      update_user: ApiRequests::def_update_user(),
      query_users: ApiRequests::def_query_users(),
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

  pub fn def_messages() -> MessageApi {
    MessageApi{recent_messages : HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent1".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}, new_message : HttpPost::<NewMessageReq, MessageId>{path : "/messages/new1".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}}
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
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct MessageApi {
  /**
   * Get recent noticeboard messages
   */
  #[serde(default="MessageApi::def_recent_messages")]
  pub recent_messages: HttpPost<RecentMessagesReq, Paginated<Message>>,

  /**
   * Post a message to the noticeboard
   */
  #[serde(default="MessageApi::def_new_message")]
  pub new_message: HttpPost<NewMessageReq, MessageId>,
}

impl MessageApi {
  pub fn new() -> MessageApi {
    MessageApi {
      recent_messages: MessageApi::def_recent_messages(),
      new_message: MessageApi::def_new_message(),
    }
  }

  pub fn def_recent_messages() -> HttpPost<RecentMessagesReq, Paginated<Message>> {
    HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent1".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_new_message() -> HttpPost<NewMessageReq, MessageId> {
    HttpPost::<NewMessageReq, MessageId>{path : "/messages/new1".to_string(), security : HttpSecurity::Public, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct LoginReq {
  pub email: StringNE,

  pub password: Password,
}

impl LoginReq {
  pub fn new(email: StringNE, password: Password) -> LoginReq {
    LoginReq {
      email: email,
      password: password,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum LoginResp {
  #[serde(rename="tokens")]
  Tokens(LoginTokens),

  #[serde(rename="invalid_credentials")]
  InvalidCredentials,
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RefreshReq {
  #[serde(default="RefreshReq::def_refresh_token")]
  pub refresh_token: Option<StringNE>,
}

impl RefreshReq {
  pub fn new() -> RefreshReq {
    RefreshReq {
      refresh_token: RefreshReq::def_refresh_token(),
    }
  }

  pub fn def_refresh_token() -> Option<StringNE> {
    None
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum RefreshResp {
  #[serde(rename="access_token")]
  AccessToken(StringNE),

  #[serde(rename="invalid_refresh_token")]
  InvalidRefreshToken,
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct LoginTokens {
  pub access_jwt: StringNE,

  pub refresh_jwt: StringNE,
}

impl LoginTokens {
  pub fn new(access_jwt: StringNE, refresh_jwt: StringNE) -> LoginTokens {
    LoginTokens {
      access_jwt: access_jwt,
      refresh_jwt: refresh_jwt,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct NewMessageReq {
  pub message: StringML,
}

impl NewMessageReq {
  pub fn new(message: StringML) -> NewMessageReq {
    NewMessageReq {
      message: message,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RecentMessagesReq {
  pub page: PageReq,
}

impl RecentMessagesReq {
  pub fn new(page: PageReq) -> RecentMessagesReq {
    RecentMessagesReq {
      page: page,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct PageReq {
  #[serde(default="PageReq::def_offset")]
  pub offset: u64,

  #[serde(default="PageReq::def_limit")]
  pub limit: u64,
}

impl PageReq {
  pub fn new() -> PageReq {
    PageReq {
      offset: PageReq::def_offset(),
      limit: PageReq::def_limit(),
    }
  }

  pub fn def_offset() -> u64 {
    0_u64
  }

  pub fn def_limit() -> u64 {
    20_u64
  }
}

/**
 * A holder for paginated results
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Paginated<T> {
  /**
   * The paginated items
   */
  pub items: Vec<T>,

  /**
   * The offset used for this query
   */
  pub current_offset: u64,

  /**
   * The size of the entire date set
   */
  pub total_count: u64,
}

impl<T> Paginated<T> {
  pub fn new(items: Vec<T>, current_offset: u64, total_count: u64) -> Paginated<T> {
    Paginated {
      items: items,
      current_offset: current_offset,
      total_count: total_count,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Message {
  pub id: MessageId,

  pub posted_at: Instant,

  pub user_fullname: String,

  pub message: StringML,
}

impl Message {
  pub fn new(id: MessageId, posted_at: Instant, user_fullname: String, message: StringML) -> Message {
    Message {
      id: id,
      posted_at: posted_at,
      user_fullname: user_fullname,
      message: message,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct QueryUsersReq {
  #[serde(default="QueryUsersReq::def_page")]
  pub page: PageReq,
}

impl QueryUsersReq {
  pub fn new() -> QueryUsersReq {
    QueryUsersReq {
      page: QueryUsersReq::def_page(),
    }
  }

  pub fn def_page() -> PageReq {
    PageReq{offset : 0_u64, limit : 20_u64}
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct User {
  pub fullname: StringNE,

  pub email: EmailAddress,

  pub is_admin: bool,
}

impl User {
  pub fn new(fullname: StringNE, email: EmailAddress, is_admin: bool) -> User {
    User {
      fullname: fullname,
      email: email,
      is_admin: is_admin,
    }
  }
}

pub type UserWithId = WithId<AppUserId, User>;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct UserDetails {
  pub fullname: StringNE,

  pub email: EmailAddress,

  pub is_admin: bool,

  pub password: Password,
}

impl UserDetails {
  pub fn new(fullname: StringNE, email: EmailAddress, is_admin: bool, password: Password) -> UserDetails {
    UserDetails {
      fullname: fullname,
      email: email,
      is_admin: is_admin,
      password: password,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct WithId<I, T> {
  pub id: I,

  pub value: T,
}

impl<I, T> WithId<I, T> {
  pub fn new(id: I, value: T) -> WithId<I, T> {
    WithId {
      id: id,
      value: value,
    }
  }
}
