import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';
import type { DomainInventoryTile } from '@/app/types/index.ts';

export function handlePressToolbarCell(idx: number): void {
  const tile = userStore.tiles[idx];
  if (tile === undefined) throw new ReferenceError(`expected tile at inventory index ${String(idx)}, got undefined`);
  const { selectedTile } = userStore;
  if (selectedTile === null) {
    if (mainStore.isTilePlaced(tile)) mainStore.undoPlaceTile(tile);
    return;
  }
  if (userStore.selectedTileIsPlaced) mainStore.undoPlaceTile(selectedTile);
  userStore.switchTiles(selectedTile, tile);
  userStore.deselectTile();
}

export function handlePressToolbarTile(tile: DomainInventoryTile): void {
  const { selectedTile } = userStore;
  if (selectedTile === null) {
    userStore.selectTile(tile);
    return;
  }
  if (!userStore.isTileSelected(tile)) {
    const selectedCell = mainStore.findCellWithTile(selectedTile);
    if (selectedCell !== undefined) {
      mainStore.undoPlaceTile(selectedTile);
      mainStore.placeTile({ cell: selectedCell, tile });
    }
    userStore.switchTiles(selectedTile, tile);
  }
  userStore.deselectTile();
}
