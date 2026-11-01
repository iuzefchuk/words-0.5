#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Randomizer {
    state: u32,
}

impl Randomizer {
    const SEED_RANGE: f64 = 4_294_967_296.0;

    pub const fn from_seed(seed: u32) -> Self {
        Self { state: seed }
    }

    pub fn next_f64(&mut self) -> f64 {
        f64::from(self.next_seed()) / Self::SEED_RANGE
    }

    pub fn next_seed(&mut self) -> u32 {
        self.state = self.state.wrapping_add(0x6D2B_79F5);
        let mut hash = (self.state ^ (self.state >> 15)).wrapping_mul(1 | self.state);
        hash = hash.wrapping_add((hash ^ (hash >> 7)).wrapping_mul(0x3D | hash)) ^ hash;
        hash ^ (hash >> 14)
    }

    pub fn derive_seed(seed: u32) -> u32 {
        Self::from_seed(seed).next_seed()
    }
}
