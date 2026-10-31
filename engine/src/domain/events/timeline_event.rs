use serde::{Deserialize, Serialize};

use crate::domain::value_objects::{MatchPlayer, MatchSettings, TurnEvaluation, TurnPlacement};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum TimelineEvent {
    MatchFinished {
        winner: Option<MatchPlayer>,
    },
    MatchStarted {
        seed: u32,
        settings: MatchSettings,
    },
    TurnPassed {
        player: MatchPlayer,
    },
    TurnSaved {
        placement: TurnPlacement,
        player: MatchPlayer,
        score: u32,
        words: Vec<String>,
    },
    TurnValidationSet {
        value: TurnEvaluation,
    },
}

impl TimelineEvent {
    pub const SCHEMA_VERSION: u32 = 6;

    pub const fn name(&self) -> &'static str {
        match self {
            Self::MatchFinished { .. } => "MatchFinished",
            Self::MatchStarted { .. } => "MatchStarted",
            Self::TurnPassed { .. } => "TurnPassed",
            Self::TurnSaved { .. } => "TurnSaved",
            Self::TurnValidationSet { .. } => "TurnValidationSet",
        }
    }

    pub const fn turn_end_player(&self) -> Option<MatchPlayer> {
        match self {
            Self::TurnPassed { player } | Self::TurnSaved { player, .. } => Some(*player),
            Self::MatchFinished { .. } | Self::MatchStarted { .. } | Self::TurnValidationSet { .. } => None,
        }
    }
}
