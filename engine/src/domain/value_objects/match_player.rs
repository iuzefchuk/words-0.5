use std::fmt;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MatchPlayer {
    Opponent,
    User,
}

impl MatchPlayer {
    pub const ALL: [Self; 2] = [Self::Opponent, Self::User];

    pub const fn index(self) -> usize {
        self as usize
    }

    #[must_use]
    pub const fn opposite(self) -> Self {
        match self {
            Self::Opponent => Self::User,
            Self::User => Self::Opponent,
        }
    }
}

impl fmt::Display for MatchPlayer {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::Opponent => "Opponent",
            Self::User => "User",
        })
    }
}
