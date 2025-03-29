// @generated from adl module common.time

use crate::adl::gen::common::strings::StringNE;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::Serializer;

/**
 * A date in ISO8601 format
 */
#[derive(Clone,Eq,Hash,PartialEq)]
pub struct LocalDate(pub String);

impl Serialize for LocalDate
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for LocalDate
{
  fn deserialize<D>(deserializer: D) -> Result<LocalDate, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = String::deserialize(deserializer)?;
      Ok(LocalDate(v))
  }
}

/**
 * A time in ISO8601 format
 */
#[derive(Clone,Eq,Hash,PartialEq)]
pub struct LocalTime(pub String);

impl Serialize for LocalTime
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for LocalTime
{
  fn deserialize<D>(deserializer: D) -> Result<LocalTime, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = String::deserialize(deserializer)?;
      Ok(LocalTime(v))
  }
}

/**
 * A datetime in ISO8601 format
 */
#[derive(Clone,Eq,Hash,PartialEq)]
pub struct LocalDateTime(pub String);

impl Serialize for LocalDateTime
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for LocalDateTime
{
  fn deserialize<D>(deserializer: D) -> Result<LocalDateTime, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = String::deserialize(deserializer)?;
      Ok(LocalDateTime(v))
  }
}

/**
 * The day of the week
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum DayOfWeek {
  #[serde(rename="monday")]
  Monday,

  #[serde(rename="tuesday")]
  Tuesday,

  #[serde(rename="wednesday")]
  Wednesday,

  #[serde(rename="thursday")]
  Thursday,

  #[serde(rename="friday")]
  Friday,

  #[serde(rename="saturday")]
  Saturday,

  #[serde(rename="sunday")]
  Sunday,
}

/**
 * A duration in ISO8601 format
 */
#[derive(Clone,Eq,Hash,PartialEq)]
pub struct Duration(pub String);

impl Serialize for Duration
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for Duration
{
  fn deserialize<D>(deserializer: D) -> Result<Duration, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = String::deserialize(deserializer)?;
      Ok(Duration(v))
  }
}

/**
 * An IANA timezone
 */
#[derive(Clone,Eq,Hash,PartialEq)]
pub struct Timezone(pub StringNE);

impl Serialize for Timezone
{
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: Serializer,
  {
      self.0.serialize(serializer)
  }
}

impl<'de> Deserialize<'de> for Timezone
{
  fn deserialize<D>(deserializer: D) -> Result<Timezone, D::Error>
  where
      D: Deserializer<'de>,
  {
      let v = StringNE::deserialize(deserializer)?;
      Ok(Timezone(v))
  }
}
