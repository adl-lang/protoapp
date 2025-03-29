// @generated from adl module protoapp.apis.ui

use crate::adl::custom::common::time::Instant;
use crate::adl::gen::common::http::HttpMethod;
use crate::adl::gen::common::http::HttpReq;
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
  pub healthy: HttpReq<(), ()>,

  /**
   * Login a user
   * The response will set an httpOnly cookie containing the refresh token
   */
  #[serde(default="ApiRequests::def_login")]
  pub login: HttpReq<LoginReq, LoginResp>,

  /**
   * Get a refreshed access token
   * If the refresh token is not provided in the request body, then it will
   * be read from the refrestToken cookie in the request.
   */
  #[serde(default="ApiRequests::def_refresh")]
  pub refresh: HttpReq<RefreshReq, RefreshResp>,

  /**
   * Clear the `refreshToken` cookie.
   */
  #[serde(default="ApiRequests::def_logout")]
  pub logout: HttpReq<Unit, Unit>,

  /**
   * Post a message to the noticeboard
   */
  #[serde(default="ApiRequests::def_new_message")]
  pub new_message: HttpReq<NewMessageReq, MessageId>,

  /**
   * Get recent noticeboard messages
   */
  #[serde(default="ApiRequests::def_recent_messages")]
  pub recent_messages: HttpReq<RecentMessagesReq, Paginated<Message>>,

  /**
   * Gets info about the logged in user
   */
  #[serde(default="ApiRequests::def_who_am_i")]
  pub who_am_i: HttpReq<(), UserWithId>,

  /**
   * Create a new user
   */
  #[serde(default="ApiRequests::def_create_user")]
  pub create_user: HttpReq<UserDetails, AppUserId>,

  /**
   * Update a user
   */
  #[serde(default="ApiRequests::def_update_user")]
  pub update_user: HttpReq<WithId<AppUserId, UserDetails>, Unit>,

  /**
   * Query users
   */
  #[serde(default="ApiRequests::def_query_users")]
  pub query_users: HttpReq<QueryUsersReq, Paginated<UserWithId>>,
}

impl ApiRequests {
  pub fn new() -> ApiRequests {
    ApiRequests {
      healthy: ApiRequests::def_healthy(),
      login: ApiRequests::def_login(),
      refresh: ApiRequests::def_refresh(),
      logout: ApiRequests::def_logout(),
      new_message: ApiRequests::def_new_message(),
      recent_messages: ApiRequests::def_recent_messages(),
      who_am_i: ApiRequests::def_who_am_i(),
      create_user: ApiRequests::def_create_user(),
      update_user: ApiRequests::def_update_user(),
      query_users: ApiRequests::def_query_users(),
    }
  }

  pub fn def_healthy() -> HttpReq<(), ()> {
    HttpReq::<(), ()>{method : HttpMethod::Get, path : "/".to_string(), security : HttpSecurity::Public, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_login() -> HttpReq<LoginReq, LoginResp> {
    HttpReq::<LoginReq, LoginResp>{method : HttpMethod::Post, path : "/login".to_string(), security : HttpSecurity::Public, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_refresh() -> HttpReq<RefreshReq, RefreshResp> {
    HttpReq::<RefreshReq, RefreshResp>{method : HttpMethod::Post, path : "/refresh".to_string(), security : HttpSecurity::Public, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_logout() -> HttpReq<Unit, Unit> {
    HttpReq::<Unit, Unit>{method : HttpMethod::Post, path : "/logout".to_string(), security : HttpSecurity::Public, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_new_message() -> HttpReq<NewMessageReq, MessageId> {
    HttpReq::<NewMessageReq, MessageId>{method : HttpMethod::Post, path : "/messages/new".to_string(), security : HttpSecurity::Token, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_recent_messages() -> HttpReq<RecentMessagesReq, Paginated<Message>> {
    HttpReq::<RecentMessagesReq, Paginated<Message>>{method : HttpMethod::Get, path : "/messages/recent".to_string(), security : HttpSecurity::Token, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_who_am_i() -> HttpReq<(), UserWithId> {
    HttpReq::<(), UserWithId>{method : HttpMethod::Get, path : "/whoami".to_string(), security : HttpSecurity::Token, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_create_user() -> HttpReq<UserDetails, AppUserId> {
    HttpReq::<UserDetails, AppUserId>{method : HttpMethod::Post, path : "/users/create".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_update_user() -> HttpReq<WithId<AppUserId, UserDetails>, Unit> {
    HttpReq::<WithId<AppUserId, UserDetails>, Unit>{method : HttpMethod::Post, path : "/users/update".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_query_users() -> HttpReq<QueryUsersReq, Paginated<UserWithId>> {
    HttpReq::<QueryUsersReq, Paginated<UserWithId>>{method : HttpMethod::Get, path : "/users/query".to_string(), security : HttpSecurity::TokenWithRole("admin".to_string()), req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
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
