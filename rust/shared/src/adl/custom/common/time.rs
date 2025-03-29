use std::time::{Duration, SystemTime, UNIX_EPOCH};

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
