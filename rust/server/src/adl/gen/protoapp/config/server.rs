// @generated from adl module protoapp.config.server

use crate::adl::gen::common::hashing::Algorithm;
use crate::adl::gen::common::hashing::Argon2idParams;
use serde::Deserialize;
use serde::Serialize;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct ServerConfig {
  pub db: DbConnectionConfig,

  #[serde(default="ServerConfig::def_db_connection_pool_size")]
  pub db_connection_pool_size: u32,

  #[serde(default="ServerConfig::def_jwt_issuer")]
  pub jwt_issuer: String,

  pub jwt_access_secret: String,

  #[serde(default="ServerConfig::def_jwt_access_expiry_secs")]
  pub jwt_access_expiry_secs: u32,

  pub jwt_refresh_secret: String,

  #[serde(default="ServerConfig::def_jwt_refresh_expiry_secs")]
  pub jwt_refresh_expiry_secs: u32,

  #[serde(default="ServerConfig::def_http_bind_addr")]
  pub http_bind_addr: String,

  #[serde(default="ServerConfig::def_password_hashing_algo")]
  pub password_hashing_algo: Algorithm,
}

impl ServerConfig {
  pub fn new(db: DbConnectionConfig, jwt_access_secret: String, jwt_refresh_secret: String) -> ServerConfig {
    ServerConfig {
      db: db,
      db_connection_pool_size: ServerConfig::def_db_connection_pool_size(),
      jwt_issuer: ServerConfig::def_jwt_issuer(),
      jwt_access_secret: jwt_access_secret,
      jwt_access_expiry_secs: ServerConfig::def_jwt_access_expiry_secs(),
      jwt_refresh_secret: jwt_refresh_secret,
      jwt_refresh_expiry_secs: ServerConfig::def_jwt_refresh_expiry_secs(),
      http_bind_addr: ServerConfig::def_http_bind_addr(),
      password_hashing_algo: ServerConfig::def_password_hashing_algo(),
    }
  }

  pub fn def_db_connection_pool_size() -> u32 {
    20_u32
  }

  pub fn def_jwt_issuer() -> String {
    "adl-protoapp.link".to_string()
  }

  pub fn def_jwt_access_expiry_secs() -> u32 {
    300_u32
  }

  pub fn def_jwt_refresh_expiry_secs() -> u32 {
    86400_u32
  }

  pub fn def_http_bind_addr() -> String {
    "0.0.0.0:8080".to_string()
  }

  pub fn def_password_hashing_algo() -> Algorithm {
    Algorithm::Argon2Id(Argon2idParams{memory : 65536_u32, iterations : 3_u32, parallelism : 2_u8, salt_length : 16_u32, key_length : 32_u32})
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct DbConnectionConfig {
  pub host: String,

  pub dbname: String,

  #[serde(default="DbConnectionConfig::def_port")]
  pub port: u32,

  pub user: String,

  pub password: String,
}

impl DbConnectionConfig {
  pub fn new(host: String, dbname: String, user: String, password: String) -> DbConnectionConfig {
    DbConnectionConfig {
      host: host,
      dbname: dbname,
      port: DbConnectionConfig::def_port(),
      user: user,
      password: password,
    }
  }

  pub fn def_port() -> u32 {
    5432_u32
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct AccessClaims {
  pub iss: String,

  pub sub: String,

  pub exp: i64,

  pub role: String,
}

impl AccessClaims {
  pub fn new(iss: String, sub: String, exp: i64, role: String) -> AccessClaims {
    AccessClaims {
      iss: iss,
      sub: sub,
      exp: exp,
      role: role,
    }
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct RefreshClaims {
  pub iss: String,

  pub sub: String,

  pub exp: i64,
}

impl RefreshClaims {
  pub fn new(iss: String, sub: String, exp: i64) -> RefreshClaims {
    RefreshClaims {
      iss: iss,
      sub: sub,
      exp: exp,
    }
  }
}
