use crate::app::{AppError, AppTurnResponse};
use crate::domain::published::{
    Dictionary, Game, InventoryTile, MatchDifficulty, MatchPlayer, MatchType, PlayfieldCell, turn_generation,
};

pub struct AppCommands<'a> {
    dictionary: &'a Dictionary,
    game: &'a mut Game,
}

impl<'a> AppCommands<'a> {
    pub(crate) fn new(game: &'a mut Game, dictionary: &'a Dictionary) -> Self {
        Self { dictionary, game }
    }

    pub fn change_match_difficulty(&mut self, difficulty: MatchDifficulty) {
        self.game.set_match_difficulty(difficulty);
    }

    pub fn change_match_type(&mut self, r#type: MatchType) {
        self.game.set_match_type(r#type);
    }

    pub fn clear_user_tiles(&mut self) -> Result<(), AppError> {
        Ok(self.game.clear_user_tiles()?)
    }

    pub fn pass_turn(&mut self) -> Result<(), AppError> {
        self.clear_user_tiles()?;
        Ok(self.game.pass_turn_for_current_player()?)
    }

    pub fn place_tile(&mut self, cell: PlayfieldCell, tile: InventoryTile) -> Result<(), AppError> {
        self.game.place_tile(cell, tile)?;
        Ok(self.game.invalidate_turn_for_current_player()?)
    }

    pub fn play_opponent_turn(&mut self) -> Result<AppTurnResponse, AppError> {
        let r#match = self.game.match_projection();
        if r#match.is_finished() || r#match.current_player() != MatchPlayer::Opponent {
            return Err(AppError::NoOpponentTurnDue);
        }
        let attempts_limit = self.game.generation_attempts_limit();
        let mut context = self.game.create_turn_generation_context(self.dictionary);
        let best = turn_generation::find_best_result(&mut context, MatchPlayer::Opponent, attempts_limit);
        let words = match best {
            None => {
                self.game.pass_turn_for_current_player()?;
                Vec::new()
            }
            Some(result) => self.game.apply_generated_turn(result)?.1,
        };
        Ok(AppTurnResponse::Saved { words })
    }

    pub fn resign_match(&mut self) -> Result<(), AppError> {
        self.clear_user_tiles()?;
        Ok(self.game.resign_match_for_current_player()?)
    }

    pub fn restart_game(&mut self) {
        self.game.restart();
    }

    pub fn save_turn(&mut self) -> Result<AppTurnResponse, AppError> {
        if let Some(error) = self.game.match_projection().current_turn_error() {
            return Ok(AppTurnResponse::Rejected { error });
        }
        let words = self.game.save_turn_for_current_player()?;
        Ok(AppTurnResponse::Saved { words })
    }

    pub fn shuffle_user_tiles(&mut self) {
        self.game.shuffle_tiles_for(MatchPlayer::User);
    }

    pub fn undo_place_tile(&mut self, tile: InventoryTile) -> Result<(), AppError> {
        self.game.undo_place_tile(tile)?;
        Ok(self.game.invalidate_turn_for_current_player()?)
    }

    pub fn validate_turn(&mut self) -> Result<(), AppError> {
        Ok(self.game.validate_turn(self.dictionary)?)
    }
}
