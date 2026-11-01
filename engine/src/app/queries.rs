use crate::app::state::{AppInventoryTileState, AppMatchState, AppPlayfieldCellState, AppPlayfieldGeometry, AppTimelineEvent};
use crate::domain::published::{
    Game, InventoryTile, Match, MatchDifficulty, MatchPlayer, MatchResult, MatchType, PlayfieldBonus, PlayfieldCell,
    TimelineEvent,
};

#[derive(Debug)]
pub struct AppQueries<'a> {
    game: &'a Game,
}

impl<'a> AppQueries<'a> {
    pub(crate) const fn new(game: &'a Game) -> Self {
        Self { game }
    }

    pub fn current_player_is_user(&self) -> bool {
        self.current_match().current_player() == MatchPlayer::User
    }

    pub fn current_turn_is_valid(&self) -> bool {
        self.current_match().current_turn_is_valid()
    }

    pub fn current_turn_score(&self) -> Option<u32> {
        self.current_match().current_turn_score()
    }

    pub fn event_log(&self) -> &'a [TimelineEvent] {
        self.game.timeline_projection().events()
    }

    pub fn match_difficulty(&self) -> MatchDifficulty {
        self.current_match().settings().difficulty
    }

    pub fn match_is_finished(&self) -> bool {
        self.current_match().is_finished()
    }

    pub fn match_result(&self) -> MatchResult {
        self.current_match().result_for(MatchPlayer::User)
    }

    pub fn match_state(&self) -> AppMatchState {
        AppMatchState {
            cells: PlayfieldCell::all().map(|cell| self.map_playfield_cell_state(cell)).collect(),
            cells_per_axis: PlayfieldCell::PER_AXIS,
            current_player_is_user: self.current_player_is_user(),
            current_turn_is_valid: self.current_turn_is_valid(),
            current_turn_score: self.current_turn_score(),
            events: self.event_log().iter().map(AppTimelineEvent::from).collect(),
            has_prior_turns: self.turn_history_has_prior_turns(),
            is_finished: self.match_is_finished(),
            opponent_score: self.opponent_score(),
            opponent_turn_is_due: self.opponent_turn_is_due(),
            result: self.match_result(),
            settings: self.current_match().settings(),
            settings_are_changeable: self.settings_are_changeable(),
            tiles_per_player: self.tiles_per_player(),
            tiles_remaining: self.tiles_remaining(),
            user_pass_will_be_resign: self.user_pass_will_be_resign(),
            user_score: self.user_score(),
            user_tiles: self
                .user_tiles()
                .iter()
                .map(|&tile| self.map_inventory_tile_state(tile))
                .collect(),
        }
    }

    pub fn match_type(&self) -> MatchType {
        self.current_match().settings().match_type
    }

    pub fn opponent_score(&self) -> u32 {
        self.current_match().score_for(MatchPlayer::Opponent)
    }

    pub fn opponent_turn_is_due(&self) -> bool {
        !self.current_match().is_finished() && self.current_match().current_player() == MatchPlayer::Opponent
    }

    pub fn playfield_geometry(&self) -> AppPlayfieldGeometry {
        AppPlayfieldGeometry {
            adjacents_by_cell: PlayfieldCell::all().map(|cell| cell.adjacents().collect()).collect(),
            center_cell: PlayfieldCell::CENTER,
            column_by_cell: PlayfieldCell::all().map(PlayfieldCell::column).collect(),
            row_by_cell: PlayfieldCell::all().map(PlayfieldCell::row).collect(),
        }
    }

    pub fn settings_are_changeable(&self) -> bool {
        !self.current_match().history_has_prior_turns()
    }

    pub fn tiles_per_player(&self) -> usize {
        self.current_match().tiles_per_player()
    }

    pub fn tiles_remaining(&self) -> usize {
        self.current_match().unused_tiles_count()
    }

    pub fn turn_history_has_prior_turns(&self) -> bool {
        self.current_match().history_has_prior_turns()
    }

    pub fn user_pass_will_be_resign(&self) -> bool {
        self.current_match().will_player_pass_be_resign(MatchPlayer::User)
    }

    pub fn user_score(&self) -> u32 {
        self.current_match().score_for(MatchPlayer::User)
    }

    pub fn user_tiles(&self) -> &'a [InventoryTile] {
        self.current_match().tiles_for(MatchPlayer::User)
    }

    pub fn find_cell_by_tile(&self, tile: InventoryTile) -> Option<PlayfieldCell> {
        self.current_match().find_cell_by_tile(tile)
    }

    pub fn find_tile_by_cell(&self, cell: PlayfieldCell) -> Option<InventoryTile> {
        self.current_match().find_tile_by_cell(cell)
    }

    pub fn cell_bonus(&self, cell: PlayfieldCell) -> Option<PlayfieldBonus> {
        self.current_match().cell_bonus(cell)
    }

    pub fn is_tile_placed(&self, tile: InventoryTile) -> bool {
        self.current_match().is_tile_placed(tile)
    }

    pub fn was_tile_used_in_previous_turn(&self, tile: InventoryTile) -> bool {
        self.current_match()
            .previous_turn_tiles()
            .is_some_and(|tiles| tiles.contains(&tile))
    }

    const fn current_match(&self) -> &'a Match {
        self.game.match_projection()
    }

    fn map_inventory_tile_state(&self, tile: InventoryTile) -> AppInventoryTileState {
        AppInventoryTileState {
            id: tile,
            letter: tile.letter(),
            points: tile.points(),
            was_used_in_previous_turn: self.was_tile_used_in_previous_turn(tile),
        }
    }

    fn map_playfield_cell_state(&self, cell: PlayfieldCell) -> AppPlayfieldCellState {
        AppPlayfieldCellState {
            bonus: self.cell_bonus(cell),
            id: cell,
            tile: self.find_tile_by_cell(cell).map(|tile| self.map_inventory_tile_state(tile)),
        }
    }
}
