use serde::{Deserialize, Serialize};

use crate::domain::value_objects::{MatchDifficulty, MatchType};

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct MatchSettings {
    pub difficulty: MatchDifficulty,
    #[serde(rename = "type")]
    pub match_type: MatchType,
}
