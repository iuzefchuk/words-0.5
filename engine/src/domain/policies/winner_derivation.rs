use std::cmp::Ordering;

use crate::domain::entities::Match;
use crate::domain::value_objects::MatchPlayer;

pub fn by_score(r#match: &Match) -> Option<MatchPlayer> {
    let user_score = r#match.get_score_for(MatchPlayer::User);
    let opponent_score = r#match.get_score_for(MatchPlayer::Opponent);
    match user_score.cmp(&opponent_score) {
        Ordering::Equal => None,
        Ordering::Greater => Some(MatchPlayer::User),
        Ordering::Less => Some(MatchPlayer::Opponent),
    }
}
