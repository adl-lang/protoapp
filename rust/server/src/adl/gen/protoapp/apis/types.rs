// @generated from adl module protoapp.apis.types

use crate::adl::custom::common::time::Instant;
use crate::adl::gen::common::capability::CapabilityToken;
use crate::adl::gen::common::strings::EmailAddress;
use crate::adl::gen::common::strings::Password;
use crate::adl::gen::common::strings::StringML;
use crate::adl::gen::common::strings::StringNE;
use crate::adl::gen::protoapp::db::AppUserId;
use crate::adl::gen::protoapp::db::MessageId;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::Serializer;

#[derive(Clone,Eq,Hash,PartialEq)]
pub struct AccessToken(pub StringNE);

impl Serialize for AccessToken
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for AccessToken
{
  fn deserialize<D>(deserializer: D) -> Result<AccessToken, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = StringNE::deserialize(deserializer)?;
      Ok(AccessToken(v))
  }
}

#[derive(Clone,Eq,Hash,PartialEq)]
pub struct RefreshToken(pub StringNE);

impl Serialize for RefreshToken
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for RefreshToken
{
  fn deserialize<D>(deserializer: D) -> Result<RefreshToken, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = StringNE::deserialize(deserializer)?;
      Ok(RefreshToken(v))
  }
}

#[derive(Clone,Eq,Hash,PartialEq)]
pub struct AdminAccessToken(pub StringNE);

impl Serialize for AdminAccessToken
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for AdminAccessToken
{
  fn deserialize<D>(deserializer: D) -> Result<AdminAccessToken, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = StringNE::deserialize(deserializer)?;
      Ok(AdminAccessToken(v))
  }
}

pub type AccessTokenMarker = CapabilityToken<AccessToken>;

pub type RefreshTokenMarker = CapabilityToken<RefreshToken>;

pub type AdminAccessTokenMarker = CapabilityToken<AdminAccessToken>;

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
pub enum NewRefreshResp {
  #[serde(rename="refresh_jwt")]
  RefreshJwt(StringNE),

  #[serde(rename="invalid_credentials")]
  InvalidCredentials,
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RefreshReq {
  /**
   * The refresh token is usually provided as a cookie, i.e. a null refresh_token in the post body.
   * The refresh_token body is used for testing purposes.
   */
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
pub struct CapRefreshReq {
}

impl CapRefreshReq {
  pub fn new() -> CapRefreshReq {
    CapRefreshReq {
    }
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
