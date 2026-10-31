use serde::Serialize;

use crate::domain::published::{MatchPlayer, TimelineEvent};

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "type")]
pub enum AppTimelineEvent {
    MatchFinished {
        winner: Option<MatchPlayer>,
    },
    MatchStarted,
    TurnPassed {
        player: MatchPlayer,
    },
    TurnSaved {
        player: MatchPlayer,
        score: u32,
        words: Vec<String>,
    },
    TurnValidationSet,
}

impl From<&TimelineEvent> for AppTimelineEvent {
    fn from(event: &TimelineEvent) -> Self {
        match event {
            TimelineEvent::MatchFinished { winner } => Self::MatchFinished { winner: *winner },
            TimelineEvent::MatchStarted { .. } => Self::MatchStarted,
            TimelineEvent::TurnPassed { player } => Self::TurnPassed { player: *player },
            TimelineEvent::TurnSaved {
                player, score, words, ..
            } => Self::TurnSaved {
                player: *player,
                score: *score,
                words: words.clone(),
            },
            TimelineEvent::TurnValidationSet { .. } => Self::TurnValidationSet,
        }
    }
}
