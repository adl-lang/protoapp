// @generated from adl module protoapp.apis.ui

use crate::adl::custom::common::time::Instant;
use crate::adl::gen::common::http::HttpGet;
use crate::adl::gen::common::http::HttpPost;
use crate::adl::gen::common::http::HttpSecurity;
use crate::adl::gen::common::http::Unit;
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
  #[serde(rename="newMessage")]
  pub new_message: HttpPost<NewMessageReq, MessageId>,

  /**
   * Update an existing message.
   * Only works for the creator and for admins 
   */
  #[serde(default="ApiRequests::def_update_message")]
  #[serde(rename="updateMessage")]
  pub update_message: HttpPost<UpdateMessageReq, Unit>,

  /**
   * Get recent noticeboard messages
   */
  #[serde(default="ApiRequests::def_recent_messages")]
  #[serde(rename="recentMessages")]
  pub recent_messages: HttpPost<RecentMessagesReq, Paginated<Message>>,

  /**
   * Gets the logged in user details
   */
  #[serde(default="ApiRequests::def_who_am_i")]
  #[serde(rename="whoAmI")]
  pub who_am_i: HttpGet<UserProfile>,
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
      update_message: ApiRequests::def_update_message(),
      recent_messages: ApiRequests::def_recent_messages(),
      who_am_i: ApiRequests::def_who_am_i(),
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

  pub fn def_update_message() -> HttpPost<UpdateMessageReq, Unit> {
    HttpPost::<UpdateMessageReq, Unit>{path : "/messages/update".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_recent_messages() -> HttpPost<RecentMessagesReq, Paginated<Message>> {
    HttpPost::<RecentMessagesReq, Paginated<Message>>{path : "/messages/recent".to_string(), security : HttpSecurity::Token, rate_limit : None, req_type : std::marker::PhantomData, resp_type : std::marker::PhantomData}
  }

  pub fn def_who_am_i() -> HttpGet<UserProfile> {
    HttpGet::<UserProfile>{path : "/whoami".to_string(), security : HttpSecurity::Token, rate_limit : None, resp_type : std::marker::PhantomData}
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
pub struct UpdateMessageReq {
  pub id: MessageId,

  pub message: StringML,
}

impl UpdateMessageReq {
  pub fn new(id: MessageId, message: StringML) -> UpdateMessageReq {
    UpdateMessageReq {
      id: id,
      message: message,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RecentMessagesReq {
  #[serde(default="RecentMessagesReq::def_offset")]
  pub offset: u32,

  #[serde(default="RecentMessagesReq::def_limit")]
  pub limit: u32,
}

impl RecentMessagesReq {
  pub fn new() -> RecentMessagesReq {
    RecentMessagesReq {
      offset: RecentMessagesReq::def_offset(),
      limit: RecentMessagesReq::def_limit(),
    }
  }

  pub fn def_offset() -> u32 {
    0_u32
  }

  pub fn def_limit() -> u32 {
    20_u32
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
pub struct UserProfile {
  pub id: AppUserId,

  pub fullname: String,

  pub email: String,

  pub is_admin: bool,
}

impl UserProfile {
  pub fn new(id: AppUserId, fullname: String, email: String, is_admin: bool) -> UserProfile {
    UserProfile {
      id: id,
      fullname: fullname,
      email: email,
      is_admin: is_admin,
    }
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
  pub current_offset: u32,

  /**
   * The size of the entire date set
   */
  pub total_count: u32,
}

impl<T> Paginated<T> {
  pub fn new(items: Vec<T>, current_offset: u32, total_count: u32) -> Paginated<T> {
    Paginated {
      items: items,
      current_offset: current_offset,
      total_count: total_count,
    }
  }
}
