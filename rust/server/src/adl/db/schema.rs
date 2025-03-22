// This file is generated from the schema definition
#![allow(unused)]

use super::types::ColumnSpec;
use sea_query::{Alias, DynIden, IntoIden};

use crate::adl::custom::common::db::DbKey;
use crate::adl::gen as adlgen;
use crate::adl::rt as adlrt;

pub struct AppUser {}

impl AppUser {
    pub fn table_str() -> &'static str {
        "app_user"
    }

    pub fn id_prefix() -> &'static str {
        "U-"
    }

    pub fn table() -> DynIden {
        Alias::new(Self::table_str()).into_iden()
    }

    pub fn id() -> ColumnSpec<DbKey<adlgen::protoapp::db::AppUserTable>> {
        ColumnSpec::new(Self::table_str(), "id")
    }

    pub fn fullname() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "fullname")
    }

    pub fn email() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "email")
    }

    pub fn is_admin() -> ColumnSpec<bool> {
        ColumnSpec::new(Self::table_str(), "is_admin")
    }

    pub fn hashed_password() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "hashed_password")
    }
}

pub struct Message {}

impl Message {
    pub fn table_str() -> &'static str {
        "message"
    }

    pub fn id_prefix() -> &'static str {
        "M-"
    }

    pub fn table() -> DynIden {
        Alias::new(Self::table_str()).into_iden()
    }

    pub fn id() -> ColumnSpec<DbKey<adlgen::protoapp::db::MessageTable>> {
        ColumnSpec::new(Self::table_str(), "id")
    }

    pub fn posted_at() -> ColumnSpec<crate::adl::custom::common::time::Instant> {
        ColumnSpec::new(Self::table_str(), "posted_at")
    }

    pub fn posted_by() -> ColumnSpec<adlgen::protoapp::db::AppUserId> {
        ColumnSpec::new(Self::table_str(), "posted_by")
    }

    pub fn message() -> ColumnSpec<adlgen::common::strings::StringML> {
        ColumnSpec::new(Self::table_str(), "message")
    }
}

