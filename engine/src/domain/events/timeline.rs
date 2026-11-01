use crate::domain::events::TimelineEvent;
use crate::domain::value_objects::MatchPlayer;

#[derive(Clone, Debug, Default)]
pub struct Timeline {
    events: Vec<TimelineEvent>,
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum TimelineError {
    #[error("cannot add {0} after MatchFinished")]
    AfterMatchFinished(&'static str),
    #[error("first event must be MatchStarted, got {0}")]
    FirstEventNotMatchStarted(&'static str),
    #[error("MatchStarted can only be the first event")]
    MatchStartedNotFirst,
    #[error("{event} by {player} cannot follow {previous} by same player")]
    SamePlayerTurnEnd {
        event: &'static str,
        player: MatchPlayer,
        previous: &'static str,
    },
}

impl Timeline {
    pub fn events(&self) -> &[TimelineEvent] {
        &self.events
    }

    pub fn record(&mut self, event: TimelineEvent) -> Result<(), TimelineError> {
        self.validate(&event)?;
        self.events.push(event);
        Ok(())
    }

    fn validate(&self, event: &TimelineEvent) -> Result<(), TimelineError> {
        let is_match_started = matches!(event, TimelineEvent::MatchStarted { .. });
        match self.events.last() {
            None if !is_match_started => return Err(TimelineError::FirstEventNotMatchStarted(event.name())),
            Some(_) if is_match_started => return Err(TimelineError::MatchStartedNotFirst),
            Some(TimelineEvent::MatchFinished { .. }) => return Err(TimelineError::AfterMatchFinished(event.name())),
            _ => {}
        }
        if let Some(player) = event.turn_end_player()
            && let Some(previous) = self.events.iter().rev().find(|recorded| recorded.turn_end_player().is_some())
            && previous.turn_end_player() == Some(player)
        {
            return Err(TimelineError::SamePlayerTurnEnd {
                event: event.name(),
                player,
                previous: previous.name(),
            });
        }
        Ok(())
    }
}
