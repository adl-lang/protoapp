// @generated from adl module common.hashing

use serde::Deserialize;
use serde::Serialize;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub enum Algorithm {
  #[serde(rename="bcrypt")]
  Bcrypt(BcryptParams),

  #[serde(rename="argon2id")]
  Argon2Id(Argon2idParams),
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct BcryptParams {
  #[serde(default="BcryptParams::def_cost")]
  pub cost: u8,
}

impl BcryptParams {
  pub fn new() -> BcryptParams {
    BcryptParams {
      cost: BcryptParams::def_cost(),
    }
  }

  pub fn def_cost() -> u8 {
    10_u8
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct Argon2idParams {
  #[serde(default="Argon2idParams::def_memory")]
  pub memory: u32,

  #[serde(default="Argon2idParams::def_iterations")]
  pub iterations: u32,

  #[serde(default="Argon2idParams::def_parallelism")]
  pub parallelism: u8,

  #[serde(default="Argon2idParams::def_salt_length")]
  #[serde(rename="saltLength")]
  pub salt_length: u32,

  #[serde(default="Argon2idParams::def_key_length")]
  #[serde(rename="keyLength")]
  pub key_length: u32,
}

impl Argon2idParams {
  pub fn new() -> Argon2idParams {
    Argon2idParams {
      memory: Argon2idParams::def_memory(),
      iterations: Argon2idParams::def_iterations(),
      parallelism: Argon2idParams::def_parallelism(),
      salt_length: Argon2idParams::def_salt_length(),
      key_length: Argon2idParams::def_key_length(),
    }
  }

  pub fn def_memory() -> u32 {
    65536_u32
  }

  pub fn def_iterations() -> u32 {
    3_u32
  }

  pub fn def_parallelism() -> u8 {
    2_u8
  }

  pub fn def_salt_length() -> u32 {
    16_u32
  }

  pub fn def_key_length() -> u32 {
    32_u32
  }
}
