<script lang="ts">
  import { getContext } from 'svelte';
  import AppCell from '@/interface/components/app/AppCell.svelte';
  import AppTile from '@/interface/components/app/AppTile.svelte';
  import { Accent } from '@/interface/enums.ts';
  import { handleDoublePressGridTile, handlePressGridCell, handlePressGridTile } from '@/interface/handlers/grid.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';
  import type { DomainPlayfieldCell } from '@/app/types/index.ts';

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
