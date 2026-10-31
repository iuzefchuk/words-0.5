use serde::{Deserialize, Serialize};

use crate::domain::value_objects::{InventoryTile, PlayfieldCell};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct TurnLink {
    pub cell: PlayfieldCell,
    pub tile: InventoryTile,
}

pub type TurnPlacement = Vec<TurnLink>;
