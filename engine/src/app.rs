mod commands;
mod error;
mod queries;
pub mod state;
mod turn_response;

use crate::Engine;
use crate::domain::published::{Game, MatchSettings, TimelineEvent};

pub use commands::AppCommands;
pub use error::AppError;
pub use queries::AppQueries;
pub use turn_response::AppTurnResponse;

#[derive(Debug)]
pub struct App<'e> {
    engine: &'e Engine,
    game: Game,
}

impl<'e> App<'e> {
    pub fn open(
        engine: &'e Engine,
        events: Option<&[TimelineEvent]>,
        settings: Option<MatchSettings>,
        seed: u32,
    ) -> Result<Self, AppError> {
        let game = match events {
            None | Some([]) => Game::new(seed, settings),
            Some(events) => {
                let mut game = Game::from_events(events)?;
                if game.match_projection().is_finished() {
                    game.restart();
                }
                game
            }
        };
        Ok(Self { engine, game })
    }

    pub fn commands(&mut self) -> AppCommands<'_> {
        AppCommands::new(&mut self.game, self.engine.dictionary())
    }

    pub const fn queries(&self) -> AppQueries<'_> {
        AppQueries::new(&self.game)
    }
}
