<script lang="ts">
  import { setContext } from 'svelte';
  import LayoutMainBoardCell from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainBoard/LayoutMainBoardCell.svelte';
  import LayoutMainBoardOutline from '@/interface/components/by-hierarchy/Layout/LayoutMain/LayoutMainBoard/LayoutMainBoardOutline/LayoutMainBoardOutline.svelte';
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
  class="board"
  role="grid"
  tabindex="-1"
  aria-rowcount={main.playfieldCellsPerAxis}
  aria-colcount={main.playfieldCellsPerAxis}
  onkeydown={rovingTabindex.onKeydown}
>
  {#each rows as row, rowIdx (rowIdx)}
    <div role="row" aria-rowindex={rowIdx + 1} class="board__row">
      {#each row as entry (entry.cell)}
        <LayoutMainBoardCell cell={entry.cell} index={entry.index} />
      {/each}
    </div>
  {/each}
  <LayoutMainBoardOutline />
</div>

<style>
  .board {
    position: relative;
    display: grid;
    grid-template-rows: repeat(var(--grid-items-per-axis), auto);
    grid-template-columns: repeat(var(--grid-items-per-axis), minmax(0, 1fr));
    gap: var(--gap-grid);
    width: 100%;
  }

  .board__row {
    display: contents;
  }
</style>
