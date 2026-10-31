use crate::domain::value_objects::{PlayfieldAxis, PlayfieldCell};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct PlayfieldAnchorCoordinates {
    pub axis: PlayfieldAxis,
    pub cell: PlayfieldCell,
}

impl PlayfieldAnchorCoordinates {
    pub const fn position(self) -> usize {
        self.cell.position(self.axis)
    }

    pub fn line(self) -> [PlayfieldCell; PlayfieldCell::PER_AXIS] {
        let (row, column) = (self.cell.row(), self.cell.column());
        std::array::from_fn(|offset| match self.axis {
            PlayfieldAxis::X => PlayfieldCell::at(row, offset),
            PlayfieldAxis::Y => PlayfieldCell::at(offset, column),
        })
    }
}
