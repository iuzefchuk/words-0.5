use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MatchResult {
    Lose,
    Tie,
    Undecided,
    Win,
}
