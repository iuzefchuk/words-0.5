<script lang="ts">
  import { setContext } from 'svelte';
  import LayoutMainGridCell from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGridCell.svelte';
  import LayoutMainGridOutline from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainGrid/LayoutMainGridOutline/LayoutMainGridOutline.svelte';
  import main from '@/interface/runes/main.svelte.ts';
  import RovingTabindex from '@/interface/runes/roving-tabindex.svelte.ts';

  let gridEl: HTMLElement | undefined;
  const rovingTabindex = new RovingTabindex(() => gridEl ?? null, '[role="gridcell"]', main.playfieldCellsPerAxis);

  const rows = $derived.by(() => {
    const size = main.playfieldCellsPerAxis;
    return Array.from({ length: size }, (_, row) =>
      main.playfieldCells.slice(row * size, (row + 1) * size).map((cell, col) => ({ cell, index: row * size + col })),
    );
  });

  setContext<() => number>('focusedItemIndex', () => rovingTabindex.focusedIndex);
</script>

<div
  bind:this={gridEl}
  class="grid app__grid"
  role="grid"
  tabindex="-1"
  aria-rowcount={main.playfieldCellsPerAxis}
  aria-colcount={main.playfieldCellsPerAxis}
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
    grid-template-rows: repeat(var(--grid-items-per-axis), auto);
    grid-template-columns: repeat(var(--grid-items-per-axis), minmax(0, 1fr));
    gap: var(--gap-grid);
  }

  .grid__row {
    display: contents;
  }
</style>
