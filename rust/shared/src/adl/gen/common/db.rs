// @generated from adl module common.db

use serde::Deserialize;
use serde::Serialize;

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct DbTable {
  #[serde(default="DbTable::def_table_name")]
  pub table_name: String,

  #[serde(default="DbTable::def_indexes")]
  pub indexes: Vec<Vec<String>>,

  #[serde(default="DbTable::def_uniqueness_constraints")]
  pub uniqueness_constraints: Vec<Vec<String>>,

  #[serde(default="DbTable::def_extra_sql")]
  pub extra_sql: Vec<String>,

  #[serde(default="DbTable::def_label")]
  pub label: Vec<String>,

  #[serde(default="DbTable::def_id_prefix")]
  pub id_prefix: String,
}

impl DbTable {
  pub fn new() -> DbTable {
    DbTable {
      table_name: DbTable::def_table_name(),
      indexes: DbTable::def_indexes(),
      uniqueness_constraints: DbTable::def_uniqueness_constraints(),
      extra_sql: DbTable::def_extra_sql(),
      label: DbTable::def_label(),
      id_prefix: DbTable::def_id_prefix(),
    }
  }

  pub fn def_table_name() -> String {
    "".to_string()
  }

  pub fn def_indexes() -> Vec<Vec<String>> {
    vec![]
  }

  pub fn def_uniqueness_constraints() -> Vec<Vec<String>> {
    vec![]
  }

  pub fn def_extra_sql() -> Vec<String> {
    vec![]
  }

  pub fn def_label() -> Vec<String> {
    vec![]
  }

  pub fn def_id_prefix() -> String {
    "".to_string()
  }
}

#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct DbView {
  #[serde(default="DbView::def_view_name")]
  pub view_name: String,
}

impl DbView {
  pub fn new() -> DbView {
    DbView {
      view_name: DbView::def_view_name(),
    }
  }

  pub fn def_view_name() -> String {
    "".to_string()
  }
}

/**
 * Field level annotation to override the name of the
 * database column.
 */
pub type DbColumnName = String;

/**
 * Field or type level annotation to override the type of the
 * database column.
 */
pub type DbColumnType = String;

/**
 * Field level annotation to indicate that that the fields
 * contained in this field should be lifted up to the current
 * table.
 */
pub type DbSpread = ();

/**
 * Field level annotation to indicate that that field
 * is part of the primary key
 */
pub type DbPrimaryKey = ();

/**
 * Extent a datatype for use as a database table, giving it a
 * primary key
 */
#[derive(Clone,Deserialize,Eq,Hash,PartialEq,Serialize)]
pub struct WithId<T> {
  pub id: String,

  pub value: T,
}

impl<T> WithId<T> {
  pub fn new(id: String, value: T) -> WithId<T> {
    WithId {
      id: id,
      value: value,
    }
  }
}
