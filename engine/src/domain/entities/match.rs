use crate::domain::entities::{Inventory, InventoryError, Playfield, PlayfieldError, PlayfieldType, Turn, TurnError};
use crate::domain::services::turn_evaluation;
use crate::domain::value_objects::{
    Dictionary, InventoryTile, MatchPlayer, MatchResult, MatchSettings, PlayfieldAnchorCoordinates, PlayfieldAxis,
    PlayfieldBonus, PlayfieldCell, Randomizer, TurnEvaluation, TurnPlacement, TurnValidationError,
};

#[derive(Clone, Debug)]
pub struct Match {
    history: Vec<Turn>,
    inventory: Inventory,
    playfield: Playfield,
    randomizer: Randomizer,
    results: [MatchResult; MatchPlayer::ALL.len()],
    settings: MatchSettings,
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum MatchError {
    #[error("cannot mutate finished match")]
    Finished,
    #[error(transparent)]
    Inventory(#[from] InventoryError),
    #[error(transparent)]
    Playfield(#[from] PlayfieldError),
    #[error("tile {tile} is not in the rack of {player}")]
    TileNotInRack { player: MatchPlayer, tile: InventoryTile },
    #[error(transparent)]
    Turn(#[from] TurnError),
    #[error("expected next player to be {expected}, got {got}")]
    WrongNextPlayer { expected: MatchPlayer, got: MatchPlayer },
    #[error("expected current player to be {expected}, got {got}")]
    WrongPlayer { expected: MatchPlayer, got: MatchPlayer },
}

impl Match {
    pub const FIRST_PLAYER: MatchPlayer = MatchPlayer::User;

    pub fn new(settings: MatchSettings, mut randomizer: Randomizer) -> Self {
        let inventory = Inventory::new(&mut randomizer);
        let playfield = Playfield::new(PlayfieldType::from(settings.match_type), &mut randomizer);
        Self {
            history: Vec::new(),
            inventory,
            playfield,
            randomizer,
            results: [MatchResult::Undecided; MatchPlayer::ALL.len()],
            settings,
        }
    }

    #[must_use]
    pub fn fork(&mut self) -> Self {
        let seed = self.randomizer.next_seed();
        let current = self.current_turn();
        let mut history = self.history[..self.history.len() - 1].to_vec();
        history.push(Turn::new(current.player()));
        Self {
            history,
            inventory: self.inventory.clone(),
            playfield: self.playfield.clone(),
            randomizer: Randomizer::from_seed(seed),
            results: self.results,
            settings: self.settings,
        }
    }

    pub fn randomizer_mut(&mut self) -> &mut Randomizer {
        &mut self.randomizer
    }

    pub const fn settings(&self) -> MatchSettings {
        self.settings
    }

    pub fn anchor_cells(&self) -> Vec<PlayfieldCell> {
        self.playfield.anchor_cells()
    }

    pub fn current_player(&self) -> MatchPlayer {
        self.current_turn().player()
    }

    pub fn current_turn_error(&self) -> Option<TurnValidationError> {
        self.current_turn().error()
    }

    pub fn current_turn_is_valid(&self) -> bool {
        self.current_turn().is_valid()
    }

    pub fn current_turn_score(&self) -> Option<u32> {
        self.current_turn().score()
    }

    pub fn current_turn_tiles(&self) -> Vec<InventoryTile> {
        self.turn_tiles(self.current_turn())
    }

    pub fn current_turn_words(&self) -> Option<&[String]> {
        self.current_turn().words()
    }

    pub fn history_has_prior_turns(&self) -> bool {
        self.history.len() > 1
    }

    pub fn is_finished(&self) -> bool {
        self.results.iter().any(|&result| result != MatchResult::Undecided)
    }

    pub fn next_player(&self) -> MatchPlayer {
        if self.history.is_empty() {
            Self::FIRST_PLAYER
        } else {
            self.current_player().opposite()
        }
    }

    pub fn previous_turn_tiles(&self) -> Option<Vec<InventoryTile>> {
        let previous = self.history.len().checked_sub(2).map(|index| &self.history[index])?;
        Some(self.turn_tiles(previous))
    }

    pub const fn tiles_per_player(&self) -> usize {
        self.inventory.tiles_per_player()
    }

    pub const fn unused_tiles_count(&self) -> usize {
        self.inventory.unused_tiles_count()
    }

    pub fn build_placement(&self, coordinates: PlayfieldAnchorCoordinates, tiles: &[InventoryTile]) -> TurnPlacement {
        self.playfield.build_placement(coordinates, tiles)
    }

    pub fn calculate_axis(&self, cells: &[PlayfieldCell]) -> Option<PlayfieldAxis> {
        self.playfield.calculate_axis(cells)
    }

    pub fn evaluate_turn(&self, dictionary: &Dictionary) -> TurnEvaluation {
        turn_evaluation::evaluate(self, dictionary)
    }

    pub const fn find_cell_by_tile(&self, tile: InventoryTile) -> Option<PlayfieldCell> {
        self.playfield.find_cell_by_tile(tile)
    }

    pub const fn find_tile_by_cell(&self, cell: PlayfieldCell) -> Option<InventoryTile> {
        self.playfield.find_tile_by_cell(cell)
    }

    pub const fn cell_bonus(&self, cell: PlayfieldCell) -> Option<PlayfieldBonus> {
        self.playfield.bonus(cell)
    }

    pub const fn result_for(&self, player: MatchPlayer) -> MatchResult {
        self.results[player.index()]
    }

    pub fn score_for(&self, player: MatchPlayer) -> u32 {
        self.history
            .iter()
            .filter(|turn| turn.player() == player)
            .filter_map(Turn::score)
            .sum()
    }

    pub fn tiles_for(&self, player: MatchPlayer) -> &[InventoryTile] {
        self.inventory.tiles_for(player)
    }

    pub fn has_tiles_for(&self, player: MatchPlayer) -> bool {
        self.inventory.has_tiles_for(player)
    }

    pub const fn is_cell_occupied(&self, cell: PlayfieldCell) -> bool {
        self.playfield.is_cell_occupied(cell)
    }

    pub const fn is_tile_placed(&self, tile: InventoryTile) -> bool {
        self.playfield.is_tile_placed(tile)
    }

    pub fn letter_multiplier(&self, cell: PlayfieldCell) -> u32 {
        self.playfield.letter_multiplier(cell)
    }

    pub fn word_multiplier(&self, cell: PlayfieldCell) -> u32 {
        self.playfield.word_multiplier(cell)
    }

    pub fn resolve_placement(&self, tiles: &[InventoryTile]) -> TurnPlacement {
        self.playfield.resolve_placement(tiles)
    }

    pub fn will_player_pass_be_resign(&self, player: MatchPlayer) -> bool {
        let previous_turns = &self.history[..self.history.len().saturating_sub(1)];
        previous_turns
            .iter()
            .rev()
            .find(|turn| turn.player() == player)
            .is_some_and(Turn::has_status_pass)
    }

    pub fn discard_tile(&mut self, player: MatchPlayer, tile: InventoryTile) -> Result<(), MatchError> {
        self.inventory.discard(player, tile)?;
        Ok(())
    }

    pub fn pass_current_turn(&mut self, player: MatchPlayer) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        self.ensure_current_player(player)?;
        self.current_turn_mut().set_status_pass()?;
        Ok(())
    }

    pub fn place_tile(&mut self, cell: PlayfieldCell, tile: InventoryTile) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        let player = self.current_player();
        if self.inventory.owner_of(tile) != Some(player) {
            return Err(MatchError::TileNotInRack { player, tile });
        }
        let link_id = self.playfield.place_tile(cell, tile)?;
        self.current_turn_mut().add_reference(link_id)?;
        Ok(())
    }

    pub fn record_completion(&mut self, winner: MatchPlayer, loser: MatchPlayer) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        self.results[winner.index()] = MatchResult::Win;
        self.results[loser.index()] = MatchResult::Lose;
        Ok(())
    }

    pub fn record_tie(&mut self, first: MatchPlayer, second: MatchPlayer) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        self.results[first.index()] = MatchResult::Tie;
        self.results[second.index()] = MatchResult::Tie;
        Ok(())
    }

    pub fn record_validation_result(&mut self, evaluation: TurnEvaluation) -> Result<(), MatchError> {
        self.current_turn_mut().set_evaluation(evaluation)?;
        Ok(())
    }

    pub fn replenish_tiles_for(&mut self, player: MatchPlayer) {
        self.inventory.replenish_tiles_for(player);
    }

    pub fn reset_current_turn(&mut self) -> Result<(), MatchError> {
        for tile in self.current_turn_tiles() {
            self.playfield.undo_place_tile(tile)?;
        }
        let player = self.current_player();
        self.history.pop();
        self.history.push(Turn::new(player));
        Ok(())
    }

    pub fn save_current_turn(&mut self, player: MatchPlayer) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        self.ensure_current_player(player)?;
        self.current_turn_mut().set_status_save()?;
        Ok(())
    }

    pub fn shuffle_tiles_for(&mut self, player: MatchPlayer) {
        let Self {
            inventory, randomizer, ..
        } = self;
        inventory.shuffle_tiles_for(player, randomizer);
    }

    pub fn start_turn_for(&mut self, player: MatchPlayer) -> Result<(), MatchError> {
        let expected = self.next_player();
        if player != expected {
            return Err(MatchError::WrongNextPlayer { expected, got: player });
        }
        self.history.push(Turn::new(player));
        Ok(())
    }

    pub fn undo_place_tile(&mut self, tile: InventoryTile) -> Result<(), MatchError> {
        self.ensure_mutability()?;
        let link_id = self.playfield.undo_place_tile(tile)?;
        self.current_turn_mut().remove_reference(link_id)?;
        Ok(())
    }

    fn current_turn(&self) -> &Turn {
        self.history.last().expect("a match always has a current turn")
    }

    fn current_turn_mut(&mut self) -> &mut Turn {
        self.history.last_mut().expect("a match always has a current turn")
    }

    fn ensure_current_player(&self, player: MatchPlayer) -> Result<(), MatchError> {
        let expected = self.current_player();
        if player == expected {
            Ok(())
        } else {
            Err(MatchError::WrongPlayer { expected, got: player })
        }
    }

    fn ensure_mutability(&self) -> Result<(), MatchError> {
        if self.is_finished() {
            Err(MatchError::Finished)
        } else {
            Ok(())
        }
    }

    fn turn_tiles(&self, turn: &Turn) -> Vec<InventoryTile> {
        turn.references()
            .iter()
            .map(|&link_id| {
                self.playfield
                    .link_tile(link_id)
                    .expect("a turn reference points at a placed link")
            })
            .collect()
    }
}
