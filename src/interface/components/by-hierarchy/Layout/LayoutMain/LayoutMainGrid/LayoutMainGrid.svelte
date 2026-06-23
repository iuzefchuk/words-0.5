<script lang="ts">
  import { setContext } from 'svelte';
  import LayoutMainGridCell from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGridCell.svelte';
  import LayoutMainGridOutline from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGridOutline/LayoutMainGridOutline.svelte';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import RovingTabindex from '@/interface/runes/roving-tabindex.svelte.ts';

  let gridEl: HTMLElement | undefined;
  const rovingTabindex = new RovingTabindex(() => gridEl ?? null, '[role="gridcell"]', mainStore.playfieldCellsPerAxis);

  const rows = $derived.by(() => {
    const size = mainStore.playfieldCellsPerAxis;
    return Array.from({ length: size }, (_, row) =>
      mainStore.playfieldCells.slice(row * size, (row + 1) * size).map((cell, col) => ({ cell, index: row * size + col })),
    );
  });

  setContext<() => number>('focusedItemIndex', () => rovingTabindex.focusedIndex);
</script>

<div
  bind:this={gridEl}
  class="grid app__create-grid--for-main-grid"
  role="grid"
  tabindex="-1"
  aria-rowcount={mainStore.playfieldCellsPerAxis}
  aria-colcount={mainStore.playfieldCellsPerAxis}
  onkeydown={rovingTabindex.onKeydown}
>
  {#each rows as row, rowIdx (rowIdx)}
    <div role="row" aria-rowindex={rowIdx + 1} class="grid__row">
      {#each row as entry (entry.cell)}
        <LayoutMainGridCell cell={entry.cell} index={entry.index} />
      {/each}
    </div>
  {/each}
  <LayoutMainGridOutline />
</div>

<style>
  .grid {
    position: relative;
    width: 100%;
  }

  .grid__row {
    display: contents;
  }
</style>
