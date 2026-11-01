use serde::Serialize;

use crate::app::state::{AppInventoryTileState, AppPlayfieldCellState, AppTimelineEvent};
use crate::domain::published::{MatchResult, MatchSettings};

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
#[expect(clippy::struct_excessive_bools)]
pub struct AppMatchState {
    pub cells: Vec<AppPlayfieldCellState>,
    pub cells_per_axis: usize,
    pub current_player_is_user: bool,
    pub current_turn_is_valid: bool,
    pub current_turn_score: Option<u32>,
    pub events: Vec<AppTimelineEvent>,
    pub has_prior_turns: bool,
    pub is_finished: bool,
    pub opponent_score: u32,
    pub opponent_turn_is_due: bool,
    pub result: MatchResult,
    pub settings: MatchSettings,
    pub settings_are_changeable: bool,
    pub tiles_per_player: usize,
    pub tiles_remaining: usize,
    pub user_pass_will_be_resign: bool,
    pub user_score: u32,
    pub user_tiles: Vec<AppInventoryTileState>,
}
