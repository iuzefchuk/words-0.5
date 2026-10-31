use crate::domain::value_objects::{
    InventoryTile, MatchType, PlayfieldAnchorCoordinates, PlayfieldAxis, PlayfieldBonus, PlayfieldBonusDistribution,
    PlayfieldCell, PlayfieldLinkId, Randomizer, TurnLink, TurnPlacement,
};

#[derive(Clone, Debug)]
pub struct Playfield {
    bonus_by_cell: PlayfieldBonusDistribution,
    cell_by_tile: [Option<PlayfieldCell>; InventoryTile::COUNT],
    links: Vec<(PlayfieldLinkId, TurnLink)>,
    next_link_id: PlayfieldLinkId,
    occupied: Vec<PlayfieldCell>,
    tile_by_cell: [Option<InventoryTile>; PlayfieldCell::COUNT],
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PlayfieldType {
    Preset,
    Random,
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum PlayfieldError {
    #[error("cell {0} is already occupied")]
    CellOccupied(PlayfieldCell),
    #[error("tile {0} is already placed")]
    TileAlreadyPlaced(InventoryTile),
    #[error("tile {0} is not placed")]
    TileNotPlaced(InventoryTile),
}

impl From<MatchType> for PlayfieldType {
    fn from(match_type: MatchType) -> Self {
        match match_type {
            MatchType::Classic => Self::Preset,
            MatchType::Random => Self::Random,
        }
    }
}

impl Playfield {
    pub fn create(r#type: PlayfieldType, randomizer: &mut Randomizer) -> Self {
        let bonus_by_cell = match r#type {
            PlayfieldType::Preset => PlayfieldBonusDistribution::preset(),
            PlayfieldType::Random => PlayfieldBonusDistribution::random(randomizer),
        };
        Self {
            bonus_by_cell,
            cell_by_tile: [None; InventoryTile::COUNT],
            links: Vec::new(),
            next_link_id: PlayfieldLinkId::new(0),
            occupied: Vec::new(),
            tile_by_cell: [None; PlayfieldCell::COUNT],
        }
    }

    pub fn anchor_cells(&self) -> Vec<PlayfieldCell> {
        if self.occupied.is_empty() {
            return vec![PlayfieldCell::CENTER];
        }
        let mut seen = [false; PlayfieldCell::COUNT];
        let mut anchors = Vec::new();
        for cell in &self.occupied {
            for adjacent in cell.adjacents() {
                if !self.is_cell_occupied(adjacent) && !seen[adjacent.index()] {
                    seen[adjacent.index()] = true;
                    anchors.push(adjacent);
                }
            }
        }
        anchors
    }

    pub const fn bonus(&self, cell: PlayfieldCell) -> Option<PlayfieldBonus> {
        self.bonus_by_cell.get(cell)
    }

    pub fn letter_multiplier(&self, cell: PlayfieldCell) -> u32 {
        self.bonus(cell).map_or(1, PlayfieldBonus::letter_multiplier)
    }

    pub fn word_multiplier(&self, cell: PlayfieldCell) -> u32 {
        self.bonus(cell).map_or(1, PlayfieldBonus::word_multiplier)
    }

    pub const fn find_cell_by_tile(&self, tile: InventoryTile) -> Option<PlayfieldCell> {
        self.cell_by_tile[tile.index()]
    }

    pub const fn find_tile_by_cell(&self, cell: PlayfieldCell) -> Option<InventoryTile> {
        self.tile_by_cell[cell.index()]
    }

    pub const fn is_cell_occupied(&self, cell: PlayfieldCell) -> bool {
        self.tile_by_cell[cell.index()].is_some()
    }

    pub const fn is_tile_placed(&self, tile: InventoryTile) -> bool {
        self.cell_by_tile[tile.index()].is_some()
    }

    pub fn link_tile(&self, link_id: PlayfieldLinkId) -> Option<InventoryTile> {
        self.links.iter().find(|(id, _)| *id == link_id).map(|(_, link)| link.tile)
    }

    pub fn place_tile(&mut self, cell: PlayfieldCell, tile: InventoryTile) -> Result<PlayfieldLinkId, PlayfieldError> {
        if self.is_cell_occupied(cell) {
            return Err(PlayfieldError::CellOccupied(cell));
        }
        if self.is_tile_placed(tile) {
            return Err(PlayfieldError::TileAlreadyPlaced(tile));
        }
        let link_id = self.next_link_id;
        self.next_link_id = link_id.next();
        self.tile_by_cell[cell.index()] = Some(tile);
        self.cell_by_tile[tile.index()] = Some(cell);
        self.occupied.push(cell);
        self.links.push((link_id, TurnLink { cell, tile }));
        Ok(link_id)
    }

    pub fn undo_place_tile(&mut self, tile: InventoryTile) -> Result<PlayfieldLinkId, PlayfieldError> {
        let cell = self.find_cell_by_tile(tile).ok_or(PlayfieldError::TileNotPlaced(tile))?;
        let index = self
            .links
            .iter()
            .position(|(_, link)| link.tile == tile)
            .ok_or(PlayfieldError::TileNotPlaced(tile))?;
        let (link_id, _) = self.links.remove(index);
        self.tile_by_cell[cell.index()] = None;
        self.cell_by_tile[tile.index()] = None;
        self.occupied.retain(|&occupied| occupied != cell);
        Ok(link_id)
    }

    pub fn calculate_axis(&self, cells: &[PlayfieldCell]) -> Option<PlayfieldAxis> {
        let normalized: Vec<PlayfieldCell> = match cells {
            [single] => single
                .adjacents()
                .find(|&adjacent| self.is_cell_occupied(adjacent))
                .map_or_else(Vec::new, |adjacent| vec![adjacent, *single]),
            _ => cells.to_vec(),
        };
        let Some(&first) = normalized.first() else {
            return Some(PlayfieldAxis::X);
        };
        if normalized.iter().all(|cell| cell.column() == first.column()) {
            return Some(PlayfieldAxis::Y);
        }
        if normalized.iter().all(|cell| cell.row() == first.row()) {
            return Some(PlayfieldAxis::X);
        }
        None
    }

    pub fn build_placement(&self, coordinates: PlayfieldAnchorCoordinates, tiles: &[InventoryTile]) -> TurnPlacement {
        assert!(!tiles.is_empty(), "cannot create placement from empty tiles");
        let mut links: TurnPlacement = Vec::new();
        let mut matched = 0;
        for cell in coordinates.line() {
            match self.find_tile_by_cell(cell) {
                None => {
                    if links.is_empty() {
                        continue;
                    }
                    if matched > 0 {
                        break;
                    }
                    links.clear();
                }
                Some(tile) => {
                    links.push(TurnLink { cell, tile });
                    if tiles.contains(&tile) {
                        matched += 1;
                    }
                }
            }
        }
        if matched == tiles.len() { links } else { Vec::new() }
    }

    pub fn resolve_placement(&self, tiles: &[InventoryTile]) -> TurnPlacement {
        let mut placement: TurnPlacement = tiles
            .iter()
            .map(|&tile| {
                let cell = self
                    .find_cell_by_tile(tile)
                    .expect("a current turn tile is placed on the playfield");
                TurnLink { cell, tile }
            })
            .collect();
        placement.sort_by_key(|link| link.cell);
        placement
    }
}
