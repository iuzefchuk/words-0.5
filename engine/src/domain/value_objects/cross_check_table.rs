use crate::domain::value_objects::{Dictionary, InventoryLetter, PlayfieldAnchorCoordinates, PlayfieldAxis, PlayfieldCell};

#[derive(Clone, Debug)]
pub struct CrossCheckTable {
    masks: Vec<u32>,
}

impl CrossCheckTable {
    pub const ALL_LETTERS_MASK: u32 = (1 << InventoryLetter::COUNT) - 1;

    pub fn precompute(dictionary: &Dictionary, letter_at: impl Fn(PlayfieldCell) -> Option<InventoryLetter>) -> Self {
        let mut table = Self {
            masks: vec![0; PlayfieldAxis::ALL.len() * PlayfieldCell::COUNT],
        };
        for axis in PlayfieldAxis::ALL {
            for cell in PlayfieldCell::all() {
                let mask = Self::compute(dictionary, &letter_at, PlayfieldAnchorCoordinates { axis, cell });
                table.masks[Self::slot(axis, cell)] = mask;
            }
        }
        table
    }

    pub fn mask(&self, axis: PlayfieldAxis, cell: PlayfieldCell) -> u32 {
        self.masks[Self::slot(axis, cell)]
    }

    pub const fn allows(mask: u32, letter: InventoryLetter) -> bool {
        mask >> letter.index() & 1 != 0
    }

    const fn slot(axis: PlayfieldAxis, cell: PlayfieldCell) -> usize {
        axis.index() * PlayfieldCell::COUNT + cell.index()
    }

    fn compute(
        dictionary: &Dictionary,
        letter_at: &impl Fn(PlayfieldCell) -> Option<InventoryLetter>,
        coordinates: PlayfieldAnchorCoordinates,
    ) -> u32 {
        let line = coordinates.line();
        let position = coordinates.position();
        let prefix: String = line[..position]
            .iter()
            .rev()
            .map_while(|&cell| letter_at(cell))
            .map(InventoryLetter::char)
            .collect();
        let prefix: String = prefix.chars().rev().collect();
        let suffix: String = line[position + 1..]
            .iter()
            .map_while(|&cell| letter_at(cell))
            .map(InventoryLetter::char)
            .collect();
        if prefix.is_empty() && suffix.is_empty() {
            return Self::ALL_LETTERS_MASK;
        }
        let Some(prefix_node) = dictionary.node(&prefix, dictionary.root()) else {
            return 0;
        };
        let mut mask = 0;
        for (letter, child) in dictionary.children(prefix_node) {
            let allowed = suffix.is_empty() || dictionary.node(&suffix, child).is_some_and(|node| dictionary.is_final(node));
            if allowed {
                mask |= 1 << letter.index();
            }
        }
        mask
    }
}
