use std::fmt;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub enum InventoryLetter {
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
}

impl InventoryLetter {
    pub const ALL: [Self; 26] = [
        Self::A,
        Self::B,
        Self::C,
        Self::D,
        Self::E,
        Self::F,
        Self::G,
        Self::H,
        Self::I,
        Self::J,
        Self::K,
        Self::L,
        Self::M,
        Self::N,
        Self::O,
        Self::P,
        Self::Q,
        Self::R,
        Self::S,
        Self::T,
        Self::U,
        Self::V,
        Self::W,
        Self::X,
        Self::Y,
        Self::Z,
    ];

    pub const COUNT: usize = Self::ALL.len();

    pub const fn index(self) -> usize {
        self as usize
    }

    pub const fn from_index(index: usize) -> Option<Self> {
        if index < Self::COUNT { Some(Self::ALL[index]) } else { None }
    }

    pub const fn char(self) -> char {
        (b'A' + self as u8) as char
    }

    pub const fn from_char(character: char) -> Option<Self> {
        if character.is_ascii_uppercase() {
            Self::from_index((character as u8 - b'A') as usize)
        } else {
            None
        }
    }

    pub const fn count(self) -> u8 {
        match self {
            Self::A | Self::I => 9,
            Self::B | Self::C | Self::F | Self::H | Self::M | Self::P | Self::V | Self::W | Self::Y => 2,
            Self::D | Self::L | Self::S | Self::U => 4,
            Self::E => 12,
            Self::G => 3,
            Self::J | Self::K | Self::Q | Self::X | Self::Z => 1,
            Self::N | Self::R | Self::T => 6,
            Self::O => 8,
        }
    }

    pub const fn points(self) -> u32 {
        match self {
            Self::A | Self::E | Self::I | Self::L | Self::N | Self::O | Self::R | Self::S | Self::T | Self::U => 1,
            Self::B | Self::C | Self::M | Self::P => 3,
            Self::D | Self::G => 2,
            Self::F | Self::H | Self::V | Self::W | Self::Y => 4,
            Self::J | Self::X => 8,
            Self::K => 5,
            Self::Q | Self::Z => 10,
        }
    }
}

impl fmt::Display for InventoryLetter {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.char().encode_utf8(&mut [0; 4]))
    }
}
