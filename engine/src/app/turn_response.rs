use serde::ser::SerializeStruct as _;
use serde::{Serialize, Serializer};

use crate::domain::published::TurnValidationError;

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum AppTurnResponse {
    Rejected { error: TurnValidationError },
    Saved { words: Vec<String> },
}

#[derive(Serialize)]
struct SavedValue<'a> {
    words: &'a [String],
}

impl Serialize for AppTurnResponse {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut response = serializer.serialize_struct("AppTurnResponse", 2)?;
        match self {
            Self::Rejected { error } => {
                response.serialize_field("error", error)?;
                response.serialize_field("ok", &false)?;
            }
            Self::Saved { words } => {
                response.serialize_field("ok", &true)?;
                response.serialize_field("value", &SavedValue { words })?;
            }
        }
        response.end()
    }
}
