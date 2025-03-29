use sqlx::types::time::OffsetDateTime;
use std::{
    marker::PhantomData,
    time::{Duration, UNIX_EPOCH},
};

use crate::adl::{
    custom::common::db::DbKey, custom::common::time::Instant, rt::custom::sys::types::maybe::Maybe,
};

use super::types::DbConversions;

impl DbConversions for Instant {
    type DbType = OffsetDateTime;

    fn to_db(&self) -> OffsetDateTime {
        let nanos = self.0.duration_since(UNIX_EPOCH).unwrap().as_nanos();
        OffsetDateTime::from_unix_timestamp_nanos(nanos as i128)
            .expect("instant should be in range")
    }

    fn from_db(dbv: OffsetDateTime) -> Self {
        let t = UNIX_EPOCH + Duration::from_nanos(dbv.unix_timestamp_nanos() as u64);
        Instant(t)
    }
}

impl DbConversions for String {
    type DbType = String;

    fn to_db(&self) -> String {
        self.clone()
    }

    fn from_db(dbv: String) -> Self {
        dbv
    }
}

impl DbConversions for bool {
    type DbType = bool;

    fn to_db(&self) -> bool {
        self.clone()
    }

    fn from_db(dbv: bool) -> Self {
        dbv
    }
}

impl DbConversions for serde_json::Value {
    type DbType = serde_json::Value;

    fn to_db(&self) -> Self::DbType {
        self.clone()
    }

    fn from_db(dbv: Self::DbType) -> Self {
        dbv
    }
}

impl DbConversions for u32 {
    type DbType = i64;

    fn to_db(&self) -> Self::DbType {
        *self as Self::DbType
    }

    fn from_db(dbv: Self::DbType) -> Self {
        dbv as Self
    }
}

impl DbConversions for u64 {
    type DbType = i64;

    fn to_db(&self) -> Self::DbType {
        *self as Self::DbType
    }

    fn from_db(dbv: Self::DbType) -> Self {
        dbv as Self
    }
}

impl<T> DbConversions for DbKey<T> {
    type DbType = String;

    fn to_db(&self) -> String {
        self.0.clone()
    }

    fn from_db(dbv: String) -> Self {
        DbKey(dbv, PhantomData)
    }
}

impl<T> DbConversions for Option<T>
where
    T: DbConversions,
{
    type DbType = Option<T::DbType>;

    fn to_db(&self) -> Option<T::DbType> {
        match self {
            None => None,
            Some(v) => Some(v.to_db()),
        }
    }

    fn from_db(dbv: Option<T::DbType>) -> Self {
        match dbv {
            None => None,
            Some(dbv) => Some(T::from_db(dbv)),
        }
    }
}

impl<T> DbConversions for Maybe<T>
where
    T: DbConversions,
{
    type DbType = Option<T::DbType>;

    fn to_db(&self) -> Option<T::DbType> {
        match self {
            Maybe(None) => None,
            Maybe(Some(v)) => Some(v.to_db()),
        }
    }

    fn from_db(dbv: Option<T::DbType>) -> Self {
        match dbv {
            None => Maybe(None),
            Some(dbv) => Maybe(Some(T::from_db(dbv))),
        }
    }
}

#[macro_export]
macro_rules! derive_db_conversions_adl {
    ($name:ty) => {
        impl crate::adl::db::types::DbConversions for $name {
            type DbType = serde_json::Value;
            fn to_db(&self) -> Self::DbType {
                serde_json::to_value(self).expect("should be able to serialize an adl value")
            }
            fn from_db(dbv: Self::DbType) -> Self {
                serde_json::from_value(dbv).expect("db adl value should be valid")
            }
        }
    };
}

#[macro_export]
macro_rules! derive_db_conversions_adl_enum {
    ($name:ty) => {
        impl crate::adl::db::types::DbConversions for $name {
            type DbType = String;
            fn to_db(&self) -> Self::DbType {
                let jv =
                    serde_json::to_value(self).expect("should be able to serialize an adl enum");
                jv.as_str().expect("adl enum should be a string").to_owned()
            }
            fn from_db(dbv: Self::DbType) -> Self {
                let jv = serde_json::Value::String(dbv);
                serde_json::from_value(jv).expect("db enum should be valid")
            }
        }
    };
}
