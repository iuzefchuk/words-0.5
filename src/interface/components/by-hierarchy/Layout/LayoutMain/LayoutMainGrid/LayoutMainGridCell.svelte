<script lang="ts">
  import { getContext } from 'svelte';
  import AppCell from '@/interface/components/app/AppCell.svelte';
  import AppTile from '@/interface/components/app/AppTile.svelte';
  import { Accent } from '@/interface/enums.ts';
  import { handleDoublePressGridTile, handlePressGridCell, handlePressGridTile } from '@/interface/handlers/grid.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import userStore from '@/interface/runes/user.svelte.ts';
  import type { DomainPlayfieldCell } from '@/app/types/index.ts';

  type Props = { cell: DomainPlayfieldCell; index: number };
  const { cell, index }: Props = $props();

  const getFocusedIndex = getContext<() => number>('focusedItemIndex');

  const isCenter = $derived(mainStore.isCellCenter(cell));
  const bonus = $derived(mainStore.getCellBonus(cell));
  const tile = $derived(mainStore.findTileOnCell(cell));
  const tileIsSelected = $derived(tile !== undefined && userStore.isTileSelected(tile));
  const tileAccent = $derived.by(() => {
    if (tile === undefined) return null;
    if (tileIsSelected) return Accent.Primary;
    if (mainStore.wasTileUsedInPreviousTurn(tile)) return Accent.Secondary;
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
  rowIndex={mainStore.getCellRowIndex(cell) + 1}
  colIndex={mainStore.getCellColumnIndex(cell) + 1}
  {bonus}
  {isFocused}
  isHighlighted={isCenter}
  isOccupied={tile !== undefined}
  onactivate={activate}
  ondoubleActivate={doubleActivate}
>
  {#if tile !== undefined && tileAccent !== null}
    <AppTile
      letter={mainStore.getTileLetter(tile)}
      accent={tileAccent}
      points={mainStore.getLetterPoints(mainStore.getTileLetter(tile))}
    />
  {/if}
</AppCell>
