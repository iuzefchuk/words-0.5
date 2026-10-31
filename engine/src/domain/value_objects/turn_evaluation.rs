use serde::{Deserialize, Serialize};

use crate::domain::value_objects::{TurnComputation, TurnValidationError};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status")]
pub enum TurnEvaluation {
    Invalid { error: TurnValidationError },
    Unknown,
    Valid { computation: TurnComputation },
}

impl TurnEvaluation {
    pub const fn error(&self) -> Option<TurnValidationError> {
        match self {
            Self::Invalid { error } => Some(*error),
            Self::Unknown | Self::Valid { .. } => None,
        }
    }

    pub const fn computation(&self) -> Option<&TurnComputation> {
        match self {
            Self::Valid { computation } => Some(computation),
            Self::Invalid { .. } | Self::Unknown => None,
        }
    }

    pub const fn is_valid(&self) -> bool {
        matches!(self, Self::Valid { .. })
    }
}
