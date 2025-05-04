use std::time::{Duration, SystemTime, UNIX_EPOCH};
use time::{macros::format_description, Date, PrimitiveDateTime, Time};

use serde::de::Error;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/**
 * A custom implementation for the ADL declaration common.time.Instant:
 *
 * newtype Instant = Int64;
 */
#[derive(Clone, Eq, Hash, PartialEq)]
pub struct Instant(pub SystemTime);

impl Serialize for Instant {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let millis = self.0.duration_since(UNIX_EPOCH).unwrap().as_millis();
        millis.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for Instant {
    fn deserialize<D>(deserializer: D) -> Result<Instant, D::Error>
    where
        D: Deserializer<'de>,
    {
        let millis = u64::deserialize(deserializer)?;
        Ok(Instant(UNIX_EPOCH + Duration::from_millis(millis)))
    }
}

/**
 * A custom implementation for the ADL declaration common.time.LocalDate:
 *
 * newtype LocalDate = String = "1970-01-01";
 */
#[derive(Clone, Eq, Hash, PartialEq)]
pub struct LocalDate(pub Date);

impl Serialize for LocalDate {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let format = format_description!("[year]-[month]-[day]");
        let s = self.0.format(&format).expect("format ok");
        s.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for LocalDate {
    fn deserialize<D>(deserializer: D) -> Result<LocalDate, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let format = format_description!("[year]-[month]-[day]");
        let nd = Date::parse(&s, format)
            .map_err(|_| D::Error::custom("LocalDate expects format YYYY-MM-DD"))?;
        Ok(LocalDate(nd))
    }
}

/**
 * A custom implementation for the ADL declaration common.time.LocalDate:
 *
 * newtype LocalTime = String = "00:00:00";
 */
#[derive(Clone, Eq, Hash, PartialEq)]
pub struct LocalTime(pub Time);

impl Serialize for LocalTime {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let format = format_description!("[hour]:[minute]:[second].[subsecond]");
        let s = self.0.format(&format).expect("format ok");
        s.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for LocalTime {
    fn deserialize<D>(deserializer: D) -> Result<LocalTime, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let format = format_description!("[hour]:[minute]:[second].[subsecond]");
        let nd = Time::parse(&s, format)
            .map_err(|_| D::Error::custom("LocalTime expects format HH:MM:SS.FFF"))?;
        Ok(LocalTime(nd))
    }
}

/**
 * A custom implementation for the ADL declaration common.time.LocalDate:
 *
 * newtype LocalDateTime = String = "1970-01-01T00:00:00";
 */
#[derive(Clone, Eq, Hash, PartialEq)]
pub struct LocalDateTime(pub PrimitiveDateTime);

impl Serialize for LocalDateTime {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let format =
            format_description!("[year]-[month]-[day]T[hour]:[minute]:[second].[subsecond]");
        let s = self.0.format(&format).expect("format ok");
        s.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for LocalDateTime {
    fn deserialize<D>(deserializer: D) -> Result<LocalDateTime, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let format =
            format_description!("[year]-[month]-[day]T[hour]:[minute]:[second].[subsecond]");
        let nd = PrimitiveDateTime::parse(&s, format).map_err(|_| {
            D::Error::custom("LocalDateTime expects format YYYY-MM-DDTHH:MM:SS.FFF")
        })?;
        Ok(LocalDateTime(nd))
    }
}
