use crate::domain::services::shuffle::shuffle;
use crate::domain::value_objects::{PlayfieldBonus, PlayfieldCell, Randomizer};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PlayfieldBonusDistribution([Option<PlayfieldBonus>; PlayfieldCell::COUNT]);

const PRESET_OCTANT_LOCATIONS: [(PlayfieldBonus, &[(usize, usize)]); 4] = [
    (PlayfieldBonus::DoubleLetter, &[(3, 0), (6, 2), (6, 6), (7, 3)]),
    (PlayfieldBonus::DoubleWord, &[(1, 1), (2, 2), (3, 3), (4, 4)]),
    (PlayfieldBonus::TripleLetter, &[(5, 1), (5, 5)]),
    (PlayfieldBonus::TripleWord, &[(0, 0), (7, 0)]),
];

impl PlayfieldBonusDistribution {
    pub fn preset() -> Self {
        let mut distribution = Self([None; PlayfieldCell::COUNT]);
        for (cell, bonus) in Self::preset_entries() {
            distribution.0[cell.index()] = Some(bonus);
        }
        distribution
    }

    pub fn random(randomizer: &mut Randomizer) -> Self {
        let mut cells: Vec<PlayfieldCell> = PlayfieldCell::all().filter(|cell| !cell.is_center()).collect();
        shuffle(&mut cells, 1, randomizer);
        let mut distribution = Self([None; PlayfieldCell::COUNT]);
        for (cell, (_, bonus)) in cells.into_iter().zip(Self::preset_entries()) {
            distribution.0[cell.index()] = Some(bonus);
        }
        distribution
    }

    pub const fn get(&self, cell: PlayfieldCell) -> Option<PlayfieldBonus> {
        self.0[cell.index()]
    }

    fn preset_entries() -> Vec<(PlayfieldCell, PlayfieldBonus)> {
        let last = PlayfieldCell::PER_AXIS - 1;
        let mut seen = [false; PlayfieldCell::COUNT];
        let mut entries = Vec::new();
        for (bonus, locations) in PRESET_OCTANT_LOCATIONS {
            for &(row, column) in locations {
                let reflections = [
                    (row, column),
                    (row, last - column),
                    (last - row, column),
                    (last - row, last - column),
                    (column, row),
                    (column, last - row),
                    (last - column, row),
                    (last - column, last - row),
                ];
                for (reflected_row, reflected_column) in reflections {
                    let cell = PlayfieldCell::at(reflected_row, reflected_column);
                    if !seen[cell.index()] {
                        seen[cell.index()] = true;
                        entries.push((cell, bonus));
                    }
                }
            }
        }
        entries
    }
}
