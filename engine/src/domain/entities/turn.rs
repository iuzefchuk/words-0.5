use std::fmt;

use crate::domain::value_objects::{MatchPlayer, PlayfieldLinkId, TurnEvaluation, TurnValidationError};

#[derive(Clone, Debug)]
pub struct Turn {
    evaluation: TurnEvaluation,
    link_ids: Vec<PlayfieldLinkId>,
    player: MatchPlayer,
    status: TurnStatus,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TurnStatus {
    Current,
    Passed,
    Saved,
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum TurnError {
    #[error("cannot mutate completed turn with status {0}")]
    Completed(TurnStatus),
    #[error("link {0} is already in current turn")]
    DuplicateLink(PlayfieldLinkId),
    #[error("link {0} is not in current turn")]
    MissingLink(PlayfieldLinkId),
}

impl Turn {
    pub fn create(player: MatchPlayer) -> Self {
        Self {
            evaluation: TurnEvaluation::Unknown,
            link_ids: Vec::new(),
            player,
            status: TurnStatus::Current,
        }
    }

    pub const fn player(&self) -> MatchPlayer {
        self.player
    }

    pub const fn error(&self) -> Option<TurnValidationError> {
        self.evaluation.error()
    }

    pub const fn is_valid(&self) -> bool {
        self.evaluation.is_valid()
    }

    pub const fn has_status_pass(&self) -> bool {
        matches!(self.status, TurnStatus::Passed)
    }

    pub fn references(&self) -> &[PlayfieldLinkId] {
        &self.link_ids
    }

    pub fn score(&self) -> Option<u32> {
        self.evaluation.computation().map(|computation| computation.score)
    }

    pub fn words(&self) -> Option<&[String]> {
        self.evaluation.computation().map(|computation| computation.words.as_slice())
    }

    pub fn add_reference(&mut self, link_id: PlayfieldLinkId) -> Result<(), TurnError> {
        self.ensure_mutability()?;
        if self.link_ids.contains(&link_id) {
            return Err(TurnError::DuplicateLink(link_id));
        }
        self.link_ids.push(link_id);
        Ok(())
    }

    pub fn remove_reference(&mut self, link_id: PlayfieldLinkId) -> Result<(), TurnError> {
        self.ensure_mutability()?;
        let index = self
            .link_ids
            .iter()
            .position(|&id| id == link_id)
            .ok_or(TurnError::MissingLink(link_id))?;
        self.link_ids.remove(index);
        Ok(())
    }

    pub fn set_evaluation(&mut self, evaluation: TurnEvaluation) -> Result<(), TurnError> {
        self.ensure_mutability()?;
        self.evaluation = evaluation;
        Ok(())
    }

    pub fn set_status_pass(&mut self) -> Result<(), TurnError> {
        self.ensure_mutability()?;
        self.status = TurnStatus::Passed;
        Ok(())
    }

    pub fn set_status_save(&mut self) -> Result<(), TurnError> {
        self.ensure_mutability()?;
        self.status = TurnStatus::Saved;
        Ok(())
    }

    fn ensure_mutability(&self) -> Result<(), TurnError> {
        match self.status {
            TurnStatus::Current => Ok(()),
            TurnStatus::Passed | TurnStatus::Saved => Err(TurnError::Completed(self.status)),
        }
    }
}

impl fmt::Display for TurnStatus {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::Current => "Current",
            Self::Passed => "Passed",
            Self::Saved => "Saved",
        })
    }
}
