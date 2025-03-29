// @generated from adl module common.ui

use crate::adl::rt::custom::sys::types::pair::Pair;
use serde::Deserialize;
use serde::Serialize;

pub type FormLabel = String;

pub type FormGroupKey = String;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct FormGroups {
  #[serde(rename="defaultKey")]
  pub default_key: FormGroupKey,

  pub labels: Vec<Pair<FormGroupKey, String>>,
}

impl FormGroups {
  pub fn new(default_key: FormGroupKey, labels: Vec<Pair<FormGroupKey, String>>) -> FormGroups {
    FormGroups {
      default_key: default_key,
      labels: labels,
    }
  }
}

/**
 * An field/type alias annotation to constrain the
 * values allowed by a string to the enumerated values
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct ValidValues {
  /**
   * The allowed values
   */
  pub values: Vec<String>,

  /**
   * A (short) user readable string describing the
   * expected text.
   */
  pub description: String,
}

impl ValidValues {
  pub fn new(values: Vec<String>, description: String) -> ValidValues {
    ValidValues {
      values: values,
      description: description,
    }
  }
}

/**
 * An field/type alias annotation to constrain the
 * values allowed by a string to a regular expression
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct ValidRegex {
  /**
   * The regexp that must be matched
   */
  pub regex: String,

  /**
   * A (short) user readable string describing the
   * expected text.
   */
  pub description: String,

  /**
   * The regex group index to return if matches
   * 0 is the entire string
   */
  #[serde(default="ValidRegex::def_return_group")]
  #[serde(rename="returnGroup")]
  pub return_group: i8,
}

impl ValidRegex {
  pub fn new(regex: String, description: String) -> ValidRegex {
    ValidRegex {
      regex: regex,
      description: description,
      return_group: ValidRegex::def_return_group(),
    }
  }

  pub fn def_return_group() -> i8 {
    0_i8
  }
}
