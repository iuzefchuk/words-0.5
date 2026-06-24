import main from '@/interface/runes/main.svelte.ts';
import user from '@/interface/runes/user.svelte.ts';
import type { DomainInventoryTile, DomainPlayfieldCell } from '@/app/types/index.ts';

export function handleDoublePressGridTile(tile: DomainInventoryTile): void {
  if (!user.isTileInToolbar(tile)) return;
  user.deselectTile();
  main.undoPlaceTile(tile);
}

export function handlePressGridCell(cell: DomainPlayfieldCell): void {
  const { selectedTile } = user;
  if (selectedTile === null) return;
  if (main.findTileOnCell(cell) !== undefined) return;
  if (user.selectedTileIsPlaced) main.undoPlaceTile(selectedTile);
  main.placeTile({ cell, tile: selectedTile });
  user.deselectTile();
}

export function handlePressGridTile(tile: DomainInventoryTile): void {
  if (!user.isTileInToolbar(tile)) return;
  if (user.isTileSelected(tile)) {
    user.deselectTile();
    return;
  }
  const { selectedTile } = user;
  if (selectedTile === null) {
    user.selectTile(tile);
    return;
  }
  const targetCell = main.findCellWithTile(tile);
  if (targetCell === undefined) return;
  const selectedCell = main.findCellWithTile(selectedTile);
  if (selectedCell !== undefined) {
    main.undoPlaceTile(selectedTile);
    main.undoPlaceTile(tile);
    main.placeTile({ cell: selectedCell, tile });
    main.placeTile({ cell: targetCell, tile: selectedTile });
  } else {
    main.undoPlaceTile(tile);
    main.placeTile({ cell: targetCell, tile: selectedTile });
    user.switchTiles(selectedTile, tile);
  }
  user.deselectTile();
}
