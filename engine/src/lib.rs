mod abi;
pub mod app;
pub mod domain;

use crate::domain::published::Dictionary;

pub use crate::app::App;

#[derive(Debug)]
pub struct Engine {
    dictionary: Dictionary,
}

impl Engine {
    pub fn new(dictionary: Box<[u8]>) -> Self {
        Self {
            dictionary: Dictionary::new(dictionary),
        }
    }

    pub fn dictionary(&self) -> &Dictionary {
        &self.dictionary
    }
}
