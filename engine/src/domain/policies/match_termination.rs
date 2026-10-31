use crate::domain::entities::Match;
use crate::domain::policies::winner_derivation;
use crate::domain::value_objects::MatchPlayer;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MatchTerminationDecision {
    Continue,
    Terminate { winner: Option<MatchPlayer> },
}

pub fn after_turn_saved(current_player: MatchPlayer, r#match: &Match) -> MatchTerminationDecision {
    if r#match.is_finished() || r#match.has_tiles_for(current_player) {
        return MatchTerminationDecision::Continue;
    }
    MatchTerminationDecision::Terminate {
        winner: winner_derivation::by_score(r#match),
    }
}
