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

pub struct Test {}

impl Test {
    pub fn table_str() -> &'static str {
        "test"
    }

    pub fn table() -> DynIden {
        Alias::new(Self::table_str()).into_iden()
    }

    pub fn uuid4() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "uuid_4")
    }

    pub fn PascalCaseName() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "pascal_case_name")
    }

    pub fn snake_case_name3() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "snake_case_name_3")
    }

    pub fn mixedCaseName_watcha_gonna_do() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "mixed_case_name_watcha_gonna_do")
    }

    pub fn AAAAHH_I_M_capitalIZed_weirdlYYY() -> ColumnSpec<adlgen::common::strings::StringNE> {
        ColumnSpec::new(Self::table_str(), "aaaahh_i_m_capital_i_zed_weirdl_yyy")
    }
}

