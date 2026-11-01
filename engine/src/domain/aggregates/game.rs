use crate::domain::entities::{Match, MatchError};
use crate::domain::events::{Timeline, TimelineError, TimelineEvent};
use crate::domain::policies::generation_difficulty;
use crate::domain::policies::match_termination::{self, MatchTerminationDecision};
use crate::domain::services::turn_generation::{TurnGenerationContext, TurnGenerationResult};
use crate::domain::value_objects::{
    Dictionary, InventoryTile, MatchDifficulty, MatchPlayer, MatchSettings, MatchType, PlayfieldCell, Randomizer, TurnEvaluation,
    TurnLink,
};

#[derive(Debug)]
pub struct Game {
    current_match: Match,
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
    pub fn new(seed: u32, settings: Option<MatchSettings>) -> Self {
        let settings = settings.unwrap_or_default();
        let mut timeline = Timeline::default();
        timeline
            .record(TimelineEvent::MatchStarted { seed, settings })
            .expect("an empty timeline accepts MatchStarted");
        let mut game = Self {
            current_match: Self::create_match(seed, settings),
            seed,
            timeline,
        };
        game.start_turn();
        game
    }

    pub fn from_events(events: &[TimelineEvent]) -> Result<Self, GameError> {
        let (first, rest) = events.split_first().ok_or(GameError::EmptyEvents)?;
        let mut timeline = Timeline::default();
        for event in events {
            timeline.record(event.clone())?;
        }
        let TimelineEvent::MatchStarted { seed, settings } = first else {
            return Err(GameError::FirstEventNotMatchStarted(first.name()));
        };
        let mut game = Self {
            current_match: Self::create_match(*seed, *settings),
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
        &self.current_match
    }

    pub const fn timeline_projection(&self) -> &Timeline {
        &self.timeline
    }

    pub fn generation_attempts_limit(&self) -> usize {
        generation_difficulty::attempts_for(self.current_match.settings().difficulty)
    }

    pub fn apply_generated_turn(&mut self, result: TurnGenerationResult) -> Result<(u32, Vec<String>), GameError> {
        for link in &result.placement {
            self.current_match.place_tile(link.cell, link.tile)?;
        }
        let score = result.computation.score;
        self.record_turn_validation(TurnEvaluation::Valid {
            computation: result.computation,
        })?;
        let words = self.save_turn_for_current_player()?;
        Ok((score, words))
    }

    pub fn clear_user_tiles(&mut self) -> Result<(), GameError> {
        self.current_match.reset_current_turn()?;
        self.record_turn_validation(TurnEvaluation::Unknown)
    }

    pub fn create_turn_generation_context<'d>(&mut self, dictionary: &'d Dictionary) -> TurnGenerationContext<'d> {
        TurnGenerationContext::new(&mut self.current_match, dictionary)
    }

    pub fn invalidate_turn_for_current_player(&mut self) -> Result<(), GameError> {
        self.record_turn_validation(TurnEvaluation::Unknown)
    }

    pub fn pass_turn_for_current_player(&mut self) -> Result<(), GameError> {
        let player = self.current_match.current_player();
        if self.current_match.will_player_pass_be_resign(player) {
            return self.record_event(&TimelineEvent::MatchFinished {
                winner: Some(player.opposite()),
            });
        }
        self.record_event(&TimelineEvent::TurnPassed { player })
    }

    pub fn place_tile(&mut self, cell: PlayfieldCell, tile: InventoryTile) -> Result<(), GameError> {
        self.current_match.place_tile(cell, tile)?;
        Ok(())
    }

    pub fn resign_match_for_current_player(&mut self) -> Result<(), GameError> {
        let winner = self.current_match.current_player().opposite();
        self.record_event(&TimelineEvent::MatchFinished { winner: Some(winner) })
    }

    pub fn restart(&mut self) {
        self.restart_with_settings(self.current_match.settings());
    }

    pub fn save_turn_for_current_player(&mut self) -> Result<Vec<String>, GameError> {
        let current_match = &self.current_match;
        if !current_match.current_turn_is_valid() {
            return Err(GameError::InvalidTurn);
        }
        let player = current_match.current_player();
        let score = current_match.current_turn_score().expect("a valid turn has a score");
        let words = current_match.current_turn_words().expect("a valid turn has words").to_vec();
        let placement = current_match.resolve_placement(&current_match.current_turn_tiles());
        self.record_event(&TimelineEvent::TurnSaved {
            placement,
            player,
            score,
            words: words.clone(),
        })?;
        if let MatchTerminationDecision::Terminate { winner } = match_termination::after_turn_saved(player, &self.current_match) {
            self.record_event(&TimelineEvent::MatchFinished { winner })?;
        }
        Ok(words)
    }

    pub fn set_match_difficulty(&mut self, difficulty: MatchDifficulty) {
        self.restart_with_settings(MatchSettings {
            difficulty,
            ..self.current_match.settings()
        });
    }

    pub fn set_match_type(&mut self, match_type: MatchType) {
        self.restart_with_settings(MatchSettings {
            match_type,
            ..self.current_match.settings()
        });
    }

    pub fn shuffle_tiles_for(&mut self, player: MatchPlayer) {
        self.current_match.shuffle_tiles_for(player);
    }

    pub fn undo_place_tile(&mut self, tile: InventoryTile) -> Result<(), GameError> {
        self.current_match.undo_place_tile(tile)?;
        Ok(())
    }

    pub fn validate_turn(&mut self, dictionary: &Dictionary) -> Result<(), GameError> {
        let evaluation = self.current_match.evaluate_turn(dictionary);
        self.record_turn_validation(evaluation)
    }

    fn create_match(seed: u32, settings: MatchSettings) -> Match {
        Match::new(settings, Randomizer::from_seed(seed))
    }

    fn start_turn(&mut self) {
        let next = self.current_match.next_player();
        self.current_match
            .start_turn_for(next)
            .expect("the next player can always start a turn");
    }

    fn apply_event_to_state(&mut self, event: &TimelineEvent) -> Result<(), GameError> {
        match event {
            TimelineEvent::MatchFinished { winner } => self.apply_match_finished(*winner),
            TimelineEvent::MatchStarted { .. } => Err(GameError::NotReplayable),
            TimelineEvent::TurnPassed { player } => {
                self.current_match.pass_current_turn(*player)?;
                self.start_turn();
                Ok(())
            }
            TimelineEvent::TurnSaved { placement, player, .. } => self.apply_turn_saved(*player, placement),
            TimelineEvent::TurnValidationSet { value } => {
                self.current_match.record_validation_result(value.clone())?;
                Ok(())
            }
        }
    }

    fn apply_match_finished(&mut self, winner: Option<MatchPlayer>) -> Result<(), GameError> {
        match winner {
            None => {
                let (current, next) = (self.current_match.current_player(), self.current_match.next_player());
                self.current_match.record_tie(current, next)?;
            }
            Some(winner) => self.current_match.record_completion(winner, winner.opposite())?,
        }
        Ok(())
    }

    fn apply_turn_saved(&mut self, player: MatchPlayer, placement: &[TurnLink]) -> Result<(), GameError> {
        for link in placement {
            if !self.current_match.is_tile_placed(link.tile) {
                self.current_match.place_tile(link.cell, link.tile)?;
            }
        }
        for link in placement {
            self.current_match.discard_tile(player, link.tile)?;
        }
        self.current_match.replenish_tiles_for(player);
        self.current_match.save_current_turn(player)?;
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
        self.timeline = Timeline::default();
        self.timeline
            .record(TimelineEvent::MatchStarted {
                seed: self.seed,
                settings,
            })
            .expect("an empty timeline accepts MatchStarted");
        self.current_match = Self::create_match(self.seed, settings);
        self.start_turn();
    }
}
