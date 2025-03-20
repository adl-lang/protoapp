use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use super::ServerConfig;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AccessClaims {
    pub iss: String,
    pub sub: String,
    pub exp: usize,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RefreshClaims {
    pub iss: String,
    pub sub: String,
    pub exp: usize,
}

pub const ROLE_ADMIN: &str = "admin";
pub const ROLE_USER: &str = "user";

pub fn create_admin_access(cfg: &ServerConfig, sub: String) -> String {
    create_access_token(cfg, ROLE_ADMIN, sub)
}

pub fn create_user_access(cfg: &ServerConfig, sub: String) -> String {
    create_access_token(cfg, ROLE_USER, sub)
}

pub fn create_refresh(cfg: &ServerConfig, sub: String) -> String {
    let exp = calc_access_exp(cfg.jwt_refresh_expiry_secs as u64);

    let claims = RefreshClaims {
        iss: cfg.jwt_issuer.clone(),
        sub,
        exp,
    };

    let key = EncodingKey::from_secret(cfg.jwt_refresh_secret.as_bytes());
    jsonwebtoken::encode(&Header::default(), &claims, &key).expect("jwt encode should succeed")
}

fn create_access_token(cfg: &ServerConfig, role: &str, sub: String) -> String {
    let exp = calc_access_exp(cfg.jwt_access_expiry_secs as u64);

    let claims = AccessClaims {
        iss: cfg.jwt_issuer.clone(),
        sub,
        exp,
        role: role.to_owned(),
    };

    let key = EncodingKey::from_secret(cfg.jwt_access_secret.as_bytes());
    jsonwebtoken::encode(&Header::default(), &claims, &key).expect("jwt encode should succeed")
}

fn calc_access_exp(expiry_secs: u64) -> usize {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .checked_add(Duration::from_secs(expiry_secs))
        .expect("duration should not overflow")
        .as_secs() as usize
}

pub fn decode_access(jwt_secret: &str, jwt: &str) -> anyhow::Result<AccessClaims> {
    let key = DecodingKey::from_secret(jwt_secret.as_bytes());
    let token = jsonwebtoken::decode::<AccessClaims>(jwt, &key, &Validation::default())?;
    Ok(token.claims)
}

pub fn decode_refresh(jwt_secret: &str, jwt: &str) -> anyhow::Result<RefreshClaims> {
    let key = DecodingKey::from_secret(jwt_secret.as_bytes());
    let token = jsonwebtoken::decode::<RefreshClaims>(jwt, &key, &Validation::default())?;
    Ok(token.claims)
}

pub fn bearer_token_from_auth_header(auth_header: &str) -> Option<String> {
    let fields: Vec<&str> = auth_header.split_ascii_whitespace().collect();
    if fields.len() == 2 && &fields.first()?.to_lowercase() == "bearer" {
        let token = *fields.get(1)?;
        return Some(token.to_owned());
    }
    None
}
