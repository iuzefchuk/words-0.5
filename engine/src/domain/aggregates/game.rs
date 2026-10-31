use crate::domain::entities::{Match, MatchError};
use crate::domain::events::{Timeline, TimelineError, TimelineEvent};
use crate::domain::policies::generation_difficulty;
use crate::domain::policies::match_termination::{self, MatchTerminationDecision};
use crate::domain::services::turn_generation::{TurnGenerationContext, TurnGenerationResult};
use crate::domain::value_objects::{
    Dictionary, InventoryTile, MatchDifficulty, MatchPlayer, MatchSettings, MatchType, PlayfieldCell, Randomizer, TurnEvaluation,
    TurnLink,
};

pub struct Game {
    r#match: Match,
    seed: u32,
    timeline: Timeline,
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum GameError {
    #[error("cannot create game from empty events")]
    EmptyEvents,
    #[error("first event must be MatchStarted, got {0}")]
    FirstEventNotMatchStarted(&'static str),
    #[error("cannot save invalid turn")]
    InvalidTurn,
    #[error(transparent)]
    Match(#[from] MatchError),
    #[error("MatchStarted is not replayable")]
    NotReplayable,
    #[error(transparent)]
    Timeline(#[from] TimelineError),
}

impl Game {
    pub fn create(seed: u32, settings: Option<MatchSettings>) -> Self {
        let settings = settings.unwrap_or_default();
        let mut timeline = Timeline::create();
        timeline
            .record(TimelineEvent::MatchStarted { seed, settings })
            .expect("an empty timeline accepts MatchStarted");
        let mut game = Self {
            r#match: Self::create_match(seed, settings),
            seed,
            timeline,
        };
        game.start_turn();
        game
    }

    pub fn create_from_events(events: &[TimelineEvent]) -> Result<Self, GameError> {
        let (first, rest) = events.split_first().ok_or(GameError::EmptyEvents)?;
        let mut timeline = Timeline::create();
        for event in events {
            timeline.record(event.clone())?;
        }
        let TimelineEvent::MatchStarted { seed, settings } = first else {
            return Err(GameError::FirstEventNotMatchStarted(first.name()));
        };
        let mut game = Self {
            r#match: Self::create_match(*seed, *settings),
            seed: *seed,
            timeline,
        };
        game.start_turn();
        for event in rest {
            game.apply_event_to_state(event)?;
        }
        Ok(game)
    }

    pub const fn match_projection(&self) -> &Match {
        &self.r#match
    }

    pub const fn timeline_projection(&self) -> &Timeline {
        &self.timeline
    }

    pub fn generation_attempts_limit(&self) -> usize {
        generation_difficulty::attempts_for(self.r#match.settings().difficulty)
    }

    pub fn apply_generated_turn(&mut self, result: TurnGenerationResult) -> Result<(u32, Vec<String>), GameError> {
        for link in &result.placement {
            self.r#match.place_tile(link.cell, link.tile)?;
        }
        let score = result.computation.score;
        self.record_turn_validation(TurnEvaluation::Valid {
            computation: result.computation,
        })?;
        let words = self.save_turn_for_current_player()?;
        Ok((score, words))
    }

    pub fn clear_user_tiles(&mut self) -> Result<(), GameError> {
        self.r#match.reset_current_turn()?;
        self.record_turn_validation(TurnEvaluation::Unknown)
    }

    pub fn create_turn_generation_context<'d>(&mut self, dictionary: &'d Dictionary) -> TurnGenerationContext<'d> {
        TurnGenerationContext::create(&mut self.r#match, dictionary)
    }

    pub fn invalidate_turn_for_current_player(&mut self) -> Result<(), GameError> {
        self.record_turn_validation(TurnEvaluation::Unknown)
    }

    pub fn pass_turn_for_current_player(&mut self) -> Result<(), GameError> {
        let player = self.r#match.current_player();
        if self.r#match.will_player_pass_be_resign(player) {
            return self.record_event(&TimelineEvent::MatchFinished {
                winner: Some(player.opposite()),
            });
        }
        self.record_event(&TimelineEvent::TurnPassed { player })
    }

    pub fn place_tile(&mut self, cell: PlayfieldCell, tile: InventoryTile) -> Result<(), GameError> {
        self.r#match.place_tile(cell, tile)?;
        Ok(())
    }

    pub fn resign_match_for_current_player(&mut self) -> Result<(), GameError> {
        let winner = self.r#match.current_player().opposite();
        self.record_event(&TimelineEvent::MatchFinished { winner: Some(winner) })
    }

    pub fn restart(&mut self) {
        self.restart_with_settings(self.r#match.settings());
    }

    pub fn save_turn_for_current_player(&mut self) -> Result<Vec<String>, GameError> {
        let r#match = &self.r#match;
        if !r#match.current_turn_is_valid() {
            return Err(GameError::InvalidTurn);
        }
        let player = r#match.current_player();
        let score = r#match.current_turn_score().expect("a valid turn has a score");
        let words = r#match.current_turn_words().expect("a valid turn has words").to_vec();
        let placement = r#match.resolve_placement(&r#match.current_turn_tiles());
        self.record_event(&TimelineEvent::TurnSaved {
            placement,
            player,
            score,
            words: words.clone(),
        })?;
        if let MatchTerminationDecision::Terminate { winner } = match_termination::after_turn_saved(player, &self.r#match) {
            self.record_event(&TimelineEvent::MatchFinished { winner })?;
        }
        Ok(words)
    }

    pub fn set_match_difficulty(&mut self, difficulty: MatchDifficulty) {
        self.restart_with_settings(MatchSettings {
            difficulty,
            ..self.r#match.settings()
        });
    }

    pub fn set_match_type(&mut self, r#type: MatchType) {
        self.restart_with_settings(MatchSettings {
            r#type,
            ..self.r#match.settings()
        });
    }

    pub fn shuffle_tiles_for(&mut self, player: MatchPlayer) {
        self.r#match.shuffle_tiles_for(player);
    }

    pub fn undo_place_tile(&mut self, tile: InventoryTile) -> Result<(), GameError> {
        self.r#match.undo_place_tile(tile)?;
        Ok(())
    }

    pub fn validate_turn(&mut self, dictionary: &Dictionary) -> Result<(), GameError> {
        let evaluation = self.r#match.evaluate_turn(dictionary);
        self.record_turn_validation(evaluation)
    }

    fn create_match(seed: u32, settings: MatchSettings) -> Match {
        Match::create(settings, Randomizer::from_seed(seed))
    }

    fn start_turn(&mut self) {
        let next = self.r#match.next_player();
        self.r#match
            .start_turn_for(next)
            .expect("the next player can always start a turn");
    }

    fn apply_event_to_state(&mut self, event: &TimelineEvent) -> Result<(), GameError> {
        match event {
            TimelineEvent::MatchFinished { winner } => self.apply_match_finished(*winner),
            TimelineEvent::MatchStarted { .. } => Err(GameError::NotReplayable),
            TimelineEvent::TurnPassed { player } => {
                self.r#match.pass_current_turn(*player)?;
                self.start_turn();
                Ok(())
            }
            TimelineEvent::TurnSaved { placement, player, .. } => self.apply_turn_saved(*player, placement),
            TimelineEvent::TurnValidationSet { value } => {
                self.r#match.record_validation_result(value.clone())?;
                Ok(())
            }
        }
    }

    fn apply_match_finished(&mut self, winner: Option<MatchPlayer>) -> Result<(), GameError> {
        match winner {
            None => {
                let (current, next) = (self.r#match.current_player(), self.r#match.next_player());
                self.r#match.record_tie(current, next)?;
            }
            Some(winner) => self.r#match.record_completion(winner, winner.opposite())?,
        }
        Ok(())
    }

    fn apply_turn_saved(&mut self, player: MatchPlayer, placement: &[TurnLink]) -> Result<(), GameError> {
        for link in placement {
            if !self.r#match.is_tile_placed(link.tile) {
                self.r#match.place_tile(link.cell, link.tile)?;
            }
        }
        for link in placement {
            self.r#match.discard_tile(player, link.tile)?;
        }
        self.r#match.replenish_tiles_for(player);
        self.r#match.save_current_turn(player)?;
        self.start_turn();
        Ok(())
    }

    fn record_event(&mut self, event: &TimelineEvent) -> Result<(), GameError> {
        self.timeline.record(event.clone())?;
        self.apply_event_to_state(event)
    }

    fn record_turn_validation(&mut self, evaluation: TurnEvaluation) -> Result<(), GameError> {
        self.record_event(&TimelineEvent::TurnValidationSet { value: evaluation })
    }

    fn restart_with_settings(&mut self, settings: MatchSettings) {
        self.seed = Randomizer::derive_seed(self.seed);
        self.timeline = Timeline::create();
        self.timeline
            .record(TimelineEvent::MatchStarted {
                seed: self.seed,
                settings,
            })
            .expect("an empty timeline accepts MatchStarted");
        self.r#match = Self::create_match(self.seed, settings);
        self.start_turn();
    }
}
