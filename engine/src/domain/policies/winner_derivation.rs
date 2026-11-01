use std::cmp::Ordering;

use crate::domain::entities::Match;
use crate::domain::value_objects::MatchPlayer;

pub fn by_score(current_match: &Match) -> Option<MatchPlayer> {
    let user_score = current_match.score_for(MatchPlayer::User);
    let opponent_score = current_match.score_for(MatchPlayer::Opponent);
    match user_score.cmp(&opponent_score) {
        Ordering::Equal => None,
        Ordering::Greater => Some(MatchPlayer::User),
        Ordering::Less => Some(MatchPlayer::Opponent),
    }
}
