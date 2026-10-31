#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum PlayfieldAxis {
    X,
    Y,
}

impl PlayfieldAxis {
    pub const ALL: [Self; 2] = [Self::X, Self::Y];

    pub const fn index(self) -> usize {
        self as usize
    }

    #[must_use]
    pub const fn opposite(self) -> Self {
        match self {
            Self::X => Self::Y,
            Self::Y => Self::X,
        }
    }
}
