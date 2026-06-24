import main from '@/interface/runes/main.svelte.ts';
import user from '@/interface/runes/user.svelte.ts';
import type { DomainInventoryTile } from '@/app/types/index.ts';

export function handlePressToolbarCell(idx: number): void {
  const tile = user.tiles[idx];
  if (tile === undefined) throw new ReferenceError(`expected tile at inventory index ${String(idx)}, got undefined`);
  const { selectedTile } = user;
  if (selectedTile === null) {
    if (main.isTilePlaced(tile)) main.undoPlaceTile(tile);
    return;
  }
  if (user.selectedTileIsPlaced) main.undoPlaceTile(selectedTile);
  user.switchTiles(selectedTile, tile);
  user.deselectTile();
}

export function handlePressToolbarTile(tile: DomainInventoryTile): void {
  const { selectedTile } = user;
  if (selectedTile === null) {
    user.selectTile(tile);
    return;
  }
  if (!user.isTileSelected(tile)) {
    const selectedCell = main.findCellWithTile(selectedTile);
    if (selectedCell !== undefined) {
      main.undoPlaceTile(selectedTile);
      main.placeTile({ cell: selectedCell, tile });
    }
    user.switchTiles(selectedTile, tile);
  }
  user.deselectTile();
}
