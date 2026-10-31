use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MatchDifficulty {
    High,
    #[default]
    Low,
    Medium,
}
