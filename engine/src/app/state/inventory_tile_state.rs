use serde::Serialize;

use crate::domain::published::{InventoryLetter, InventoryTile};

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInventoryTileState {
    pub id: InventoryTile,
    pub letter: InventoryLetter,
    pub points: u32,
    pub was_used_in_previous_turn: bool,
}
