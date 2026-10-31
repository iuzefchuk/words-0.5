use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PlayfieldBonus {
    DoubleLetter,
    DoubleWord,
    TripleLetter,
    TripleWord,
}

impl PlayfieldBonus {
    pub const fn letter_multiplier(self) -> u32 {
        match self {
            Self::DoubleLetter => 2,
            Self::TripleLetter => 3,
            Self::DoubleWord | Self::TripleWord => 1,
        }
    }

    pub const fn word_multiplier(self) -> u32 {
        match self {
            Self::DoubleWord => 2,
            Self::TripleWord => 3,
            Self::DoubleLetter | Self::TripleLetter => 1,
        }
    }
}
