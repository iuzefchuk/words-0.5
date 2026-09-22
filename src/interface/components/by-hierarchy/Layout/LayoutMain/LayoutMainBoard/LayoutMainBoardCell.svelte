<script lang="ts">
  import { getContext } from 'svelte';
  import AppCell from '@/interface/components/app/AppCell.svelte';
  import AppTile from '@/interface/components/app/AppTile.svelte';
  import { Accent } from '@/interface/enums.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';
  import type { DomainInventoryTile, DomainPlayfieldCell } from '@/app/types/index.ts';

  type Props = { cell: DomainPlayfieldCell; index: number };
  const { cell, index }: Props = $props();

  const getFocusedIndex = getContext<() => number>('focusedItemIndex');

  const isCenter = $derived(main.isCellCenter(cell));
  const bonus = $derived(main.getCellBonus(cell));
  const tile = $derived(main.findTileOnCell(cell));
  const tileIsSelected = $derived(tile !== undefined && user.isTileSelected(tile));
  const tileAccent = $derived.by(() => {
    if (tile === undefined) return null;
    if (tileIsSelected) return Accent.Primary;
    if (main.wasTileUsedInPreviousTurn(tile)) return Accent.Secondary;
    return Accent.Tertiary;
  });
  const isFocused = $derived(getFocusedIndex() === index);

  function activate(): void {
    if (tile !== undefined) handlePressGridTile(tile);
    else handlePressGridCell(cell);
  }

  function doubleActivate(): void {
    if (tile !== undefined) handleDoublePressGridTile(tile);
  }

  function handleDoublePressGridTile(tile: DomainInventoryTile): void {
    if (!user.isTileInToolbar(tile)) return;
    user.deselectTile();
    main.undoPlaceTile(tile);
  }

  function handlePressGridCell(cell: DomainPlayfieldCell): void {
    const { selectedTile } = user;
    if (selectedTile === null) return;
    if (main.findTileOnCell(cell) !== undefined) return;
    if (user.selectedTileIsPlaced) main.undoPlaceTile(selectedTile);
    main.placeTile({ cell, tile: selectedTile });
    user.deselectTile();
  }

  function handlePressGridTile(tile: DomainInventoryTile): void {
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
</script>

<AppCell
  rowIndex={main.getCellRowIndex(cell) + 1}
  colIndex={main.getCellColumnIndex(cell) + 1}
  {bonus}
  {isFocused}
  isHighlighted={isCenter}
  isOccupied={tile !== undefined}
  onactivate={activate}
  ondoubleActivate={doubleActivate}
>
  {#if tile !== undefined && tileAccent !== null}
    <AppTile letter={main.getTileLetter(tile)} accent={tileAccent} points={main.getLetterPoints(main.getTileLetter(tile))} />
  {/if}
</AppCell>
