use crate::domain::services::shuffle::shuffle;
use crate::domain::value_objects::{InventoryTile, MatchPlayer, Randomizer};

#[derive(Clone, Debug)]
pub struct Inventory {
    bag: Vec<InventoryTile>,
    discarded: Vec<InventoryTile>,
    racks: [Vec<InventoryTile>; MatchPlayer::ALL.len()],
}

#[derive(Clone, Debug, PartialEq, Eq, thiserror::Error)]
pub enum InventoryError {
    #[error("tile {tile} is not owned by {player}")]
    TileNotOwned { player: MatchPlayer, tile: InventoryTile },
}

impl Inventory {
    pub const TILES_PER_PLAYER: usize = 7;

    pub fn new(randomizer: &mut Randomizer) -> Self {
        let mut bag: Vec<InventoryTile> = InventoryTile::all().collect();
        shuffle(&mut bag, 1, randomizer);
        let mut inventory = Self {
            bag,
            discarded: Vec::new(),
            racks: Default::default(),
        };
        for player in MatchPlayer::ALL {
            inventory.replenish_tiles_for(player);
        }
        inventory
    }

    pub const fn tiles_per_player(&self) -> usize {
        Self::TILES_PER_PLAYER
    }

    pub const fn unused_tiles_count(&self) -> usize {
        self.bag.len()
    }

    pub fn tiles_for(&self, player: MatchPlayer) -> &[InventoryTile] {
        &self.racks[player.index()]
    }

    pub fn has_tiles_for(&self, player: MatchPlayer) -> bool {
        !self.racks[player.index()].is_empty()
    }

    pub fn owner_of(&self, tile: InventoryTile) -> Option<MatchPlayer> {
        MatchPlayer::ALL
            .into_iter()
            .find(|player| self.racks[player.index()].contains(&tile))
    }

    pub fn discard(&mut self, player: MatchPlayer, tile: InventoryTile) -> Result<(), InventoryError> {
        let rack = &mut self.racks[player.index()];
        let index = rack
            .iter()
            .position(|&owned| owned == tile)
            .ok_or(InventoryError::TileNotOwned { player, tile })?;
        self.discarded.push(rack.remove(index));
        Ok(())
    }

    pub fn replenish_tiles_for(&mut self, player: MatchPlayer) {
        let rack = &mut self.racks[player.index()];
        let draw_count = Self::TILES_PER_PLAYER.saturating_sub(rack.len()).min(self.bag.len());
        let draw_start = self.bag.len() - draw_count;
        rack.extend(self.bag.drain(draw_start..).rev());
    }

    pub fn shuffle_tiles_for(&mut self, player: MatchPlayer, randomizer: &mut Randomizer) {
        shuffle(&mut self.racks[player.index()], 1, randomizer);
    }
}
