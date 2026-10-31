use crate::domain::value_objects::InventoryLetter;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct DictionaryNode(u32);

pub struct Dictionary {
    bytes: Vec<u8>,
}

impl Dictionary {
    const BITMAP_MASK: u32 = 0x03FF_FFFF;

    const FINAL_BIT: u32 = 1 << 26;

    const HEADER_BYTES: usize = 4;

    const POINTER_BYTES: usize = 3;

    pub const fn new(bytes: Vec<u8>) -> Self {
        Self { bytes }
    }

    pub const fn root(&self) -> DictionaryNode {
        DictionaryNode(0)
    }

    pub fn is_final(&self, node: DictionaryNode) -> bool {
        self.header(node) & Self::FINAL_BIT != 0
    }

    pub fn node(&self, word: &str, start: DictionaryNode) -> Option<DictionaryNode> {
        word.chars().try_fold(start, |node, character| {
            self.step(node, InventoryLetter::from_char(character)?)
        })
    }

    pub fn step(&self, node: DictionaryNode, letter: InventoryLetter) -> Option<DictionaryNode> {
        let bitmap = self.header(node) & Self::BITMAP_MASK;
        if bitmap >> letter.index() & 1 == 0 {
            return None;
        }
        let child_index = (bitmap & ((1 << letter.index()) - 1)).count_ones() as usize;
        Some(self.child(node, child_index))
    }

    pub fn children(&self, node: DictionaryNode) -> impl Iterator<Item = (InventoryLetter, DictionaryNode)> + '_ {
        let bitmap = self.header(node) & Self::BITMAP_MASK;
        let mut child_index = 0;
        InventoryLetter::ALL.into_iter().filter_map(move |letter| {
            if bitmap >> letter.index() & 1 == 0 {
                return None;
            }
            let child = self.child(node, child_index);
            child_index += 1;
            Some((letter, child))
        })
    }

    pub fn contains_all_words(&self, words: &[String]) -> bool {
        assert!(!words.is_empty(), "cannot check membership of empty word list");
        words
            .iter()
            .all(|word| self.node(word, self.root()).is_some_and(|node| self.is_final(node)))
    }

    fn header(&self, node: DictionaryNode) -> u32 {
        let offset = node.0 as usize;
        u32::from_le_bytes([
            self.bytes[offset],
            self.bytes[offset + 1],
            self.bytes[offset + 2],
            self.bytes[offset + 3],
        ])
    }

    fn child(&self, node: DictionaryNode, child_index: usize) -> DictionaryNode {
        let offset = node.0 as usize + Self::HEADER_BYTES + child_index * Self::POINTER_BYTES;
        DictionaryNode(u32::from_le_bytes([
            self.bytes[offset],
            self.bytes[offset + 1],
            self.bytes[offset + 2],
            0,
        ]))
    }
}
