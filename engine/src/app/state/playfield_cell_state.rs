use serde::Serialize;

use crate::app::state::AppInventoryTileState;
use crate::domain::published::{PlayfieldBonus, PlayfieldCell};

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPlayfieldCellState {
    pub bonus: Option<PlayfieldBonus>,
    pub id: PlayfieldCell,
    pub tile: Option<AppInventoryTileState>,
}
