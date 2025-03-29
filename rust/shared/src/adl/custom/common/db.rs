use std::marker::PhantomData;

use rand::distributions::{Alphanumeric, DistString};
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/**
 * A reference for a database stored value, referenced by a
 * string primary key. A custom implementation for the ADL
 * declaration common.db.DbKey:
 *
 * newtype DbKey<T>= String;
 */
#[derive(Clone)]
pub struct DbKey<T>(pub String, pub PhantomData<T>);

impl<T> Serialize for DbKey<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.0.serialize(serializer)
    }
}

impl<'de, T> Deserialize<'de> for DbKey<T> {
    fn deserialize<D>(deserializer: D) -> Result<DbKey<T>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let v = String::deserialize(deserializer)?;
        Ok(DbKey(v, PhantomData))
    }
}

impl<T> Eq for DbKey<T> {}

impl<T> std::hash::Hash for DbKey<T> {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.0.hash(state);
    }
}

impl<T> PartialEq for DbKey<T> {
    fn eq(&self, other: &Self) -> bool {
        self.0.eq(&other.0)
    }
}

impl<T> DbKey<T> {
    pub fn from_string(s: String) -> DbKey<T> {
        DbKey(s, PhantomData)
    }

    pub fn new(prefix: &str) -> DbKey<T> {
        let idstr = Alphanumeric.sample_string(&mut rand::thread_rng(), 24);
        DbKey(format!("{}{}", prefix, idstr), PhantomData)
    }
}
