use serde::Serialize;

use crate::domain::published::PlayfieldCell;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPlayfieldGeometry {
    pub adjacents_by_cell: Vec<Vec<PlayfieldCell>>,
    pub center_cell: PlayfieldCell,
    pub column_by_cell: Vec<usize>,
    pub row_by_cell: Vec<usize>,
}
