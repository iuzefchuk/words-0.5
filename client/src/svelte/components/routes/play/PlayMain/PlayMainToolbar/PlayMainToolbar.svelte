<script lang="ts">
  import { fade } from 'svelte/transition';
  import { TransitionDuration } from '@/client/enums.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import PlayMainToolbarStats from '@/client/svelte/components/routes/play/PlayMain/PlayMainToolbar/PlayMainToolbarStats.svelte';
  import AppGridItem, { AppGridItemElevation, AppGridItemTone } from '@/client/svelte/components/shared/AppGridItem.svelte';
  import type { PlayBlock, PlayBlockId } from '@/client/domain/types.ts';

  const runtime = getPlayRuntimeContext();

  const blocks = $derived(
    Array.from({ length: runtime.blocksPerPlayer }, (_, idx): null | PlayBlock => runtime.userBlocks[idx] ?? null),
  );

  function activate(idx: number, block: null | PlayBlock): void {
    if (block === null) return;
    if (runtime.isBlockSlotted(block.id)) {
      handlePressToolbarSlot(idx);
      return;
    }
    handlePressToolbarBlock(block.id);
  }

  function handlePressToolbarBlock(blockId: PlayBlockId): void {
    const { selectedBlockId } = runtime;
    if (selectedBlockId === null) {
      runtime.selectBlock(blockId);
      return;
    }
    if (!runtime.isBlockSelected(blockId)) {
      const selectedSlotId = runtime.findSlotWithBlock(selectedBlockId);
      runtime.swapBlocks(selectedBlockId, blockId);
      if (selectedSlotId !== undefined) {
        void (async (): Promise<void> => {
          await runtime.undoSlotBlock(selectedBlockId);
          await runtime.slotBlock({ blockId, slotId: selectedSlotId });
        })();
      }
    }
    runtime.deselectBlock();
  }

  function handlePressToolbarSlot(idx: number): void {
    const block = runtime.userBlocks[idx];
    if (block === undefined) throw new ReferenceError(`expected block at index ${String(idx)}, got undefined`);
    const { selectedBlockId } = runtime;
    if (selectedBlockId === null) {
      if (runtime.isBlockSlotted(block.id)) void runtime.undoSlotBlock(block.id);
      return;
    }
    const wasSlotted = runtime.selectedBlockIsSlotted;
    runtime.swapBlocks(selectedBlockId, block.id);
    runtime.deselectBlock();
    if (wasSlotted) void runtime.undoSlotBlock(selectedBlockId);
  }
</script>

<div class="toolbar" role="toolbar" tabindex="-1">
  <ul class="toolbar__grid">
    {#each blocks as block, idx (idx)}
      <li class="toolbar__slot">
        <button
          type="button"
          class="toolbar__button"
          disabled={!runtime.isActionableForUser || block === null}
          onclick={event => {
            event.stopPropagation();
            activate(idx, block);
          }}
        >
          {#if block !== null && runtime.isBlockInToolbar(block.id) && !runtime.isBlockSlotted(block.id)}
            <AppGridItem
              elevation={AppGridItemElevation.High}
              tone={runtime.isBlockSelected(block.id) ? AppGridItemTone.Bolder : AppGridItemTone.Mid}
              text={block.letter}
              textSecondary={String(block.points)}
              ariaLabel={`${block.letter} letter / ${block.points} pts`}
            />
          {/if}
        </button>
      </li>
    {/each}
    {#if runtime.blocksRemaining > 0}
      <li role="none" transition:fade|global={{ duration: TransitionDuration.Short }}>
        <PlayMainToolbarStats />
      </li>
    {/if}
  </ul>
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding-top: calc(var(--padding-primary) * 2);
  }

  .toolbar__grid {
    display: grid;
    grid-template-rows: repeat(1, auto);
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: calc(var(--gap-grid) * 2);
    width: 100%;

    > li {
      display: grid;
      aspect-ratio: 1 / 1;
    }
  }

  .toolbar__slot {
    background: light-dark(var(--color-level-4), var(--color-level-8));
    border-radius: calc(var(--radius-grid) * 2);
    box-shadow: var(--shadow-level-0);
  }

  .toolbar__button {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: inherit;

    &:disabled {
      cursor: not-allowed;
    }
  }
</style>
