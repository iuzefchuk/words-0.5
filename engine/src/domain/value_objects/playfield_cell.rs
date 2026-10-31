use std::fmt;

use serde::{Deserialize, Serialize};

use crate::domain::value_objects::PlayfieldAxis;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(transparent)]
pub struct PlayfieldCell(u8);

impl PlayfieldCell {
    const SIDE: u8 = 15;

    pub const PER_AXIS: usize = Self::SIDE as usize;

    pub const COUNT: usize = Self::PER_AXIS * Self::PER_AXIS;

    pub const CENTER: Self = Self(Self::SIDE * Self::SIDE / 2);

    pub fn all() -> impl Iterator<Item = Self> {
        (0u8..).take(Self::COUNT).map(Self)
    }

    #[allow(clippy::cast_possible_truncation)]
    pub const fn new(index: usize) -> Option<Self> {
        if index < Self::COUNT { Some(Self(index as u8)) } else { None }
    }

    #[allow(clippy::cast_possible_truncation)]
    pub const fn at(row: usize, column: usize) -> Self {
        Self((row * Self::PER_AXIS + column) as u8)
    }

    pub const fn index(self) -> usize {
        self.0 as usize
    }

    pub const fn row(self) -> usize {
        self.index() / Self::PER_AXIS
    }

    pub const fn column(self) -> usize {
        self.index() % Self::PER_AXIS
    }

    pub const fn is_center(self) -> bool {
        self.0 == Self::CENTER.0
    }

    pub const fn position(self, axis: PlayfieldAxis) -> usize {
        match axis {
            PlayfieldAxis::X => self.column(),
            PlayfieldAxis::Y => self.row(),
        }
    }

    pub fn adjacents(self) -> impl Iterator<Item = Self> {
        let (row, column) = (self.row(), self.column());
        [
            (column > 0).then(|| Self(self.0 - 1)),
            (column < Self::PER_AXIS - 1).then(|| Self(self.0 + 1)),
            (row > 0).then(|| Self(self.0 - Self::SIDE)),
            (row < Self::PER_AXIS - 1).then(|| Self(self.0 + Self::SIDE)),
        ]
        .into_iter()
        .flatten()
    }
}

impl fmt::Display for PlayfieldCell {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.0.fmt(formatter)
    }
}
