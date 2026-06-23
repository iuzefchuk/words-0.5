import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';
import type { DomainInventoryTile, DomainPlayfieldCell } from '@/app/types/index.ts';

export function handleDoublePressGridTile(tile: DomainInventoryTile): void {
  if (!userStore.isTileInToolbar(tile)) return;
  userStore.deselectTile();
  mainStore.undoPlaceTile(tile);
}

export function handlePressGridCell(cell: DomainPlayfieldCell): void {
  const { selectedTile } = userStore;
  if (selectedTile === null) return;
  if (mainStore.findTileOnCell(cell) !== undefined) return;
  if (userStore.selectedTileIsPlaced) mainStore.undoPlaceTile(selectedTile);
  mainStore.placeTile({ cell, tile: selectedTile });
  userStore.deselectTile();
}

export function handlePressGridTile(tile: DomainInventoryTile): void {
  if (!userStore.isTileInToolbar(tile)) return;
  if (userStore.isTileSelected(tile)) {
    userStore.deselectTile();
    return;
  }
  const { selectedTile } = userStore;
  if (selectedTile === null) {
    userStore.selectTile(tile);
    return;
  }
  const targetCell = mainStore.findCellWithTile(tile);
  if (targetCell === undefined) return;
  const selectedCell = mainStore.findCellWithTile(selectedTile);
  if (selectedCell !== undefined) {
    mainStore.undoPlaceTile(selectedTile);
    mainStore.undoPlaceTile(tile);
    mainStore.placeTile({ cell: selectedCell, tile });
    mainStore.placeTile({ cell: targetCell, tile: selectedTile });
  } else {
    mainStore.undoPlaceTile(tile);
    mainStore.placeTile({ cell: targetCell, tile: selectedTile });
    userStore.switchTiles(selectedTile, tile);
  }
  userStore.deselectTile();
}
