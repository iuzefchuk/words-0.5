use crate::domain::value_objects::MatchDifficulty;

pub const fn attempts_for(difficulty: MatchDifficulty) -> usize {
    match difficulty {
        MatchDifficulty::High => usize::MAX,
        MatchDifficulty::Low => 1,
        MatchDifficulty::Medium => 20,
    }
}
