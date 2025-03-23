// @generated from adl module protoapp.db

use crate::adl::custom::common::db::DbKey;
use crate::adl::custom::common::time::Instant;
use crate::adl::gen::common::db::WithId;
use crate::adl::gen::common::strings::StringML;
use crate::adl::gen::common::strings::StringNE;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::Serializer;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct AppUser {
  pub fullname: StringNE,

  pub email: StringNE,

  pub is_admin: bool,

  #[serde(default="AppUser::def_hashed_password")]
  pub hashed_password: StringNE,
}

impl AppUser {
  pub fn new(fullname: StringNE, email: StringNE, is_admin: bool) -> AppUser {
    AppUser {
      fullname: fullname,
      email: email,
      is_admin: is_admin,
      hashed_password: AppUser::def_hashed_password(),
    }
  }

  pub fn def_hashed_password() -> StringNE {
    "".to_string()
  }
}

#[derive(Clone,Eq,Hash,PartialEq)]
pub struct AppUserTable(pub WithId<AppUser>);

impl Serialize for AppUserTable
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for AppUserTable
{
  fn deserialize<D>(deserializer: D) -> Result<AppUserTable, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = WithId::<AppUser>::deserialize(deserializer)?;
      Ok(AppUserTable(v))
  }
}

pub type AppUserId = DbKey<AppUserTable>;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Message {
  pub posted_at: Instant,

  pub posted_by: AppUserId,

  pub message: StringML,
}

impl Message {
  pub fn new(posted_at: Instant, posted_by: AppUserId, message: StringML) -> Message {
    Message {
      posted_at: posted_at,
      posted_by: posted_by,
      message: message,
    }
  }
}

#[derive(Clone,Eq,Hash,PartialEq)]
pub struct MessageTable(pub WithId<Message>);

impl Serialize for MessageTable
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for MessageTable
{
  fn deserialize<D>(deserializer: D) -> Result<MessageTable, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = WithId::<Message>::deserialize(deserializer)?;
      Ok(MessageTable(v))
  }
}

pub type MessageId = DbKey<MessageTable>;
