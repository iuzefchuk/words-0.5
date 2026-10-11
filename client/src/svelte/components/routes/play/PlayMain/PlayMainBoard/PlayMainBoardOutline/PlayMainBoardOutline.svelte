<script lang="ts">
  import { fade } from 'svelte/transition';
  import { TransitionDuration } from '@/client/enums.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import PlayMainBoardOutlineTooltip from '@/client/svelte/components/routes/play/PlayMain/PlayMainBoard/PlayMainBoardOutline/PlayMainBoardOutlineTooltip.svelte';
  import type { PlayBlock } from '@/client/domain/types/PlayBlock.ts';
  import type { PlaySlotId } from '@/client/domain/types/PlaySlotId.ts';

  const runtime = getPlayRuntimeContext();

  type Bounds = { col: number; colSpan: number; row: number; rowSpan: number };

  const bounds = $derived(computeBounds(runtime.userBlocks));

  function computeBounds(blocks: ReadonlyArray<PlayBlock>): ReadonlyArray<Bounds> {
    const slotIds = findSlotIdsFor(blocks);
    if (slotIds.size === 0) return [];
    const visited = new Set<PlaySlotId>();
    const groups: Array<Bounds> = [];
    for (const slotId of slotIds) {
      if (visited.has(slotId)) continue;
      groups.push(floodFillBounds(slotId, slotIds, visited));
    }
    return groups;
  }

  function findSlotIdsFor(blocks: ReadonlyArray<PlayBlock>): Set<PlaySlotId> {
    const slotIds = new Set<PlaySlotId>();
    for (const block of blocks) {
      const slotId = runtime.findSlotWithBlock(block.id);
      if (slotId !== undefined) slotIds.add(slotId);
    }
    return slotIds;
  }

  function floodFillBounds(startId: PlaySlotId, slotIds: ReadonlySet<PlaySlotId>, visited: Set<PlaySlotId>): Bounds {
    const stack: Array<PlaySlotId> = [startId];
    visited.add(startId);
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;
    while (stack.length > 0) {
      const slotId = stack.pop();
      if (slotId === undefined) throw new ReferenceError('expected slot id from traversal stack, got undefined');
      const row = runtime.getSlotRow(slotId);
      const col = runtime.getSlotColumn(slotId);
      if (row < minRow) minRow = row;
      if (row > maxRow) maxRow = row;
      if (col < minCol) minCol = col;
      if (col > maxCol) maxCol = col;
      for (const adjacentId of runtime.getSlotAdjacents(slotId)) {
        if (!slotIds.has(adjacentId) || visited.has(adjacentId)) continue;
        visited.add(adjacentId);
        stack.push(adjacentId);
      }
    }
    return { col: minCol, colSpan: maxCol - minCol + 1, row: minRow, rowSpan: maxRow - minRow + 1 };
  }

  function isAnchorAt(idx: number): boolean {
    if (runtime.currentTurnScore === null) return false;
    let minRow = Infinity;
    let anchorIdx = -1;
    let rightmostEdge = -Infinity;
    for (let cursor = 0; cursor < bounds.length; cursor++) {
      const group = bounds[cursor];
      if (group === undefined) throw new ReferenceError(`expected bounds at index ${String(cursor)}, got undefined`);
      if (group.row < minRow) {
        minRow = group.row;
        anchorIdx = cursor;
        rightmostEdge = group.col + group.colSpan;
      } else if (group.row === minRow) {
        const edge = group.col + group.colSpan;
        if (edge > rightmostEdge) {
          anchorIdx = cursor;
          rightmostEdge = edge;
        }
      }
    }
    return idx === anchorIdx;
  }

  function isOnRightmostColumnAt(idx: number): boolean {
    const group = bounds[idx];
    if (group === undefined) return false;
    return group.col + group.colSpan >= runtime.slotsPerAxis;
  }
</script>

{#each bounds as group, idx (idx)}
  <div
    class="outline"
    role="presentation"
    style:--step="calc((100% + var(--gap-grid)) / var(--grid-slots-per-axis))"
    style:top={`calc(var(--step) * ${group.row})`}
    style:left={`calc(var(--step) * ${group.col})`}
    style:width={`calc(var(--step) * ${group.colSpan} - var(--gap-grid) - 1px)`}
    style:height={`calc(var(--step) * ${group.rowSpan} - var(--gap-grid) - 1px)`}
  >
    {#if isAnchorAt(idx)}
      <div transition:fade|global={{ duration: TransitionDuration.Normal }}>
        <PlayMainBoardOutlineTooltip isFlipped={isOnRightmostColumnAt(idx)} />
      </div>
    {/if}
  </div>
{/each}

<style>
  .outline {
    position: absolute;
    z-index: var(--z-index-level-1);
    pointer-events: none;
    outline: var(--outline);
    border-radius: var(--radius-grid);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: top, left, width, height, outline;
  }
</style>
