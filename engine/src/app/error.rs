use crate::domain::published::GameError;

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum AppError {
    #[error(transparent)]
    Game(#[from] GameError),
    #[error("no opponent turn is due")]
    NoOpponentTurnDue,
}
