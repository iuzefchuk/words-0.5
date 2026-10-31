use std::fmt;
use std::str::FromStr;

use serde::de::Error as _;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

use crate::domain::value_objects::InventoryLetter;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct InventoryTile(u8);

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
#[error("tile {0} does not exist")]
pub struct ParseInventoryTileError(String);

const fn count_tiles() -> usize {
    let mut total = 0;
    let mut index = 0;
    while index < InventoryLetter::COUNT {
        total += InventoryLetter::ALL[index].count() as usize;
        index += 1;
    }
    total
}

const fn first_by_letter() -> [u8; InventoryLetter::COUNT] {
    let mut table = [0; InventoryLetter::COUNT];
    let mut index = 1;
    while index < InventoryLetter::COUNT {
        table[index] = table[index - 1] + InventoryLetter::ALL[index - 1].count();
        index += 1;
    }
    table
}

const fn letter_by_tile() -> [InventoryLetter; InventoryTile::COUNT] {
    let mut table = [InventoryLetter::A; InventoryTile::COUNT];
    let mut tile = 0;
    let mut index = 0;
    while index < InventoryLetter::COUNT {
        let letter = InventoryLetter::ALL[index];
        let mut ordinal = 0;
        while ordinal < letter.count() {
            table[tile] = letter;
            tile += 1;
            ordinal += 1;
        }
        index += 1;
    }
    table
}

impl InventoryTile {
    pub const COUNT: usize = count_tiles();

    const FIRST_BY_LETTER: [u8; InventoryLetter::COUNT] = first_by_letter();

    const LETTER_BY_TILE: [InventoryLetter; Self::COUNT] = letter_by_tile();

    pub fn all() -> impl Iterator<Item = Self> {
        (0u8..).take(Self::COUNT).map(Self)
    }

    pub const fn new(letter: InventoryLetter, ordinal: u8) -> Option<Self> {
        if ordinal < letter.count() {
            Some(Self(Self::FIRST_BY_LETTER[letter.index()] + ordinal))
        } else {
            None
        }
    }

    pub const fn index(self) -> usize {
        self.0 as usize
    }

    pub const fn letter(self) -> InventoryLetter {
        Self::LETTER_BY_TILE[self.index()]
    }

    pub const fn points(self) -> u32 {
        self.letter().points()
    }

    const fn ordinal(self) -> u8 {
        self.0 - Self::FIRST_BY_LETTER[self.letter().index()]
    }
}

impl fmt::Display for InventoryTile {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{}-{}", self.letter(), self.ordinal())
    }
}

impl FromStr for InventoryTile {
    type Err = ParseInventoryTileError;

    fn from_str(text: &str) -> Result<Self, Self::Err> {
        let error = || ParseInventoryTileError(text.to_owned());
        let (letter, ordinal) = text.split_once('-').ok_or_else(error)?;
        let letter = letter
            .chars()
            .next()
            .filter(|_| letter.len() == 1)
            .and_then(InventoryLetter::from_char)
            .ok_or_else(error)?;
        let ordinal = ordinal
            .parse::<u8>()
            .ok()
            .filter(|_| !ordinal.starts_with('+'))
            .ok_or_else(error)?;
        Self::new(letter, ordinal).ok_or_else(error)
    }
}

impl Serialize for InventoryTile {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.collect_str(self)
    }
}

impl<'de> Deserialize<'de> for InventoryTile {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        String::deserialize(deserializer)?.parse().map_err(D::Error::custom)
    }
}
