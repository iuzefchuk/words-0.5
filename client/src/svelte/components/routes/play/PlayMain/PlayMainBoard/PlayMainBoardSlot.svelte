<script lang="ts">
  import mapPlaySlotBonusAppGridItemTone from '@/client/domain/maps/mapPlaySlotBonusAppGridItemTone.ts';
  import mapPlaySlotBonusJson from '@/client/domain/maps/mapPlaySlotBonusJson.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import AppGridItem, { AppGridItemElevation, AppGridItemTone } from '@/client/svelte/components/shared/AppGridItem.svelte';
  import type { PlayBlockId } from '@/client/domain/types/PlayBlockId.ts';
  import type { PlaySlotId } from '@/client/domain/types/PlaySlotId.ts';

  type Props = { slotId: PlaySlotId };
  const { slotId }: Props = $props();

  const runtime = getPlayRuntimeContext();
  const rowIndex = $derived(runtime.getSlotRow(slotId) + 1);
  const colIndex = $derived(runtime.getSlotColumn(slotId) + 1);
  const isCenter = $derived(runtime.isSlotCenter(slotId));
  const bonus = $derived(runtime.getSlotBonus(slotId));
  const bonusTone = $derived(bonus === null ? undefined : mapPlaySlotBonusAppGridItemTone(bonus));
  const block = $derived(runtime.findBlockInSlot(slotId));
  const blockIsSelected = $derived(block !== null && runtime.isBlockSelected(block.id));
  const blockTone = $derived.by(() => {
    if (block === null) return null;
    if (blockIsSelected) return AppGridItemTone.Bolder;
    if (block.wasUsedInPreviousTurn) return AppGridItemTone.Bold;
    return AppGridItemTone.Mid;
  });

  function handleDoublePressBoardBlock(blockId: PlayBlockId): void {
    if (!runtime.isBlockInToolbar(blockId)) return;
    runtime.deselectBlock();
    void runtime.undoSlotBlock(blockId);
  }

  function handlePress(): void {
    if (block !== null) handlePressBoardBlock(block.id);
    else handlePressBoardSlot();
  }

  function handlePressBoardBlock(blockId: PlayBlockId): void {
    if (!runtime.isBlockInToolbar(blockId)) return;
    if (runtime.isBlockSelected(blockId)) {
      runtime.deselectBlock();
      return;
    }
    const { selectedBlockId } = runtime;
    if (selectedBlockId === null) {
      runtime.selectBlock(blockId);
      return;
    }
    const targetSlotId = runtime.findSlotWithBlock(blockId);
    if (targetSlotId === undefined) return;
    const selectedSlotId = runtime.findSlotWithBlock(selectedBlockId);
    runtime.deselectBlock();
    void (async (): Promise<void> => {
      if (selectedSlotId !== undefined) {
        await runtime.undoSlotBlock(selectedBlockId);
        await runtime.undoSlotBlock(blockId);
        await runtime.slotBlock({ blockId, slotId: selectedSlotId });
        await runtime.slotBlock({ blockId: selectedBlockId, slotId: targetSlotId });
      } else {
        await runtime.undoSlotBlock(blockId);
        await runtime.slotBlock({ blockId: selectedBlockId, slotId: targetSlotId });
        runtime.swapBlocks(selectedBlockId, blockId);
      }
    })();
  }

  function handlePressBoardSlot(): void {
    const { selectedBlockId } = runtime;
    if (selectedBlockId === null) return;
    if (runtime.findBlockInSlot(slotId) !== null) return;
    const wasSlotted = runtime.selectedBlockIsSlotted;
    runtime.deselectBlock();
    void (async (): Promise<void> => {
      if (wasSlotted) await runtime.undoSlotBlock(selectedBlockId);
      await runtime.slotBlock({ blockId: selectedBlockId, slotId });
    })();
  }

  function onClick(event: MouseEvent): void {
    event.stopPropagation();
    handlePress();
  }

  function onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (block !== null) handleDoublePressBoardBlock(block.id);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    handlePress();
  }
</script>

<button
  role="gridcell"
  aria-rowindex={rowIndex}
  aria-colindex={colIndex}
  aria-label={block === null && bonus === null ? `Row ${rowIndex}, Column ${colIndex}, empty` : undefined}
  class="slot"
  onclick={onClick}
  onkeydown={onKeydown}
  ondblclick={onDoubleClick}
>
  <AppGridItem
    elevation={isCenter ? AppGridItemElevation.Low : AppGridItemElevation.Mid}
    tone={bonusTone}
    text={bonus === null ? undefined : mapPlaySlotBonusJson(bonus)}
  />
  {#if block !== null && blockTone !== null}
    <AppGridItem
      elevation={AppGridItemElevation.High}
      tone={blockTone}
      text={block.letter}
      textSecondary={String(block.points)}
      ariaLabel={`${block.letter} letter / ${block.points} pts`}
    />
  {/if}
</button>

<style>
  .slot {
    display: grid;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
    max-width: var(--space-4xl);
    aspect-ratio: 1 / 1;
    cursor: pointer;
    border-radius: var(--radius-grid);

    & > :global(*) {
      grid-area: 1 / 1;
    }
  }
</style>
