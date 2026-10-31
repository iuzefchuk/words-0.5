use serde::{Deserialize, Serialize};

use crate::domain::value_objects::TurnPlacement;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TurnComputation {
    pub placements: Vec<TurnPlacement>,
    pub score: u32,
    pub words: Vec<String>,
}
