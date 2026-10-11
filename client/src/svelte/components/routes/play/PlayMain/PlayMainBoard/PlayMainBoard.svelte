<script lang="ts">
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import PlayMainBoardOutline from '@/client/svelte/components/routes/play/PlayMain/PlayMainBoard/PlayMainBoardOutline/PlayMainBoardOutline.svelte';
  import PlayMainBoardSlot from '@/client/svelte/components/routes/play/PlayMain/PlayMainBoard/PlayMainBoardSlot.svelte';

  const runtime = getPlayRuntimeContext();

  const rows = $derived.by(() => {
    const size = runtime.slotsPerAxis;
    return Array.from({ length: size }, (_, row) => runtime.slotIds.slice(row * size, (row + 1) * size));
  });
</script>

<div class="grid" role="grid" tabindex="-1" aria-rowcount={runtime.slotsPerAxis} aria-colcount={runtime.slotsPerAxis}>
  {#each rows as row, rowIdx (rowIdx)}
    <div role="row" aria-rowindex={rowIdx + 1} class="grid__row">
      {#each row as slotId (slotId)}
        <PlayMainBoardSlot {slotId} />
      {/each}
    </div>
  {/each}
  <PlayMainBoardOutline />
</div>

<style>
  .grid {
    position: relative;
    display: grid;
    grid-template-rows: repeat(var(--grid-slots-per-axis), auto);
    grid-template-columns: repeat(var(--grid-slots-per-axis), minmax(0, 1fr));
    gap: var(--gap-grid);
    width: 100%;
  }

  .grid__row {
    display: contents;
  }
</style>
