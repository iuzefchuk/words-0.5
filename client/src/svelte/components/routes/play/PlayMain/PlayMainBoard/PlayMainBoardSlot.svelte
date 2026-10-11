<script lang="ts">
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import AppGridItem, { AppGridItemElevation, AppGridItemTone } from '@/client/svelte/components/shared/AppGridItem.svelte';
  import { PlayRuntimeSlotBonus } from '@/client/svelte/runes/PlayRuntime.svelte.ts';
  import type { PlayRuntimeBlockId, PlayRuntimeSlotId } from '@/client/svelte/runes/PlayRuntime.svelte.ts';

  type Props = { slotId: PlayRuntimeSlotId };
  const { slotId }: Props = $props();

  const runtime = getPlayRuntimeContext();
  const rowIndex = $derived(runtime.getSlotRow(slotId) + 1);
  const colIndex = $derived(runtime.getSlotColumn(slotId) + 1);
  const isCenter = $derived(runtime.isSlotCenter(slotId));
  const bonus = $derived(runtime.getSlotBonus(slotId));
  const bonusTone = $derived.by(() => {
    if (bonus === null) return undefined;
    return {
      [PlayRuntimeSlotBonus.DoubleLetter]: AppGridItemTone.Faint,
      [PlayRuntimeSlotBonus.DoubleWord]: AppGridItemTone.Bold,
      [PlayRuntimeSlotBonus.TripleLetter]: AppGridItemTone.Mid,
      [PlayRuntimeSlotBonus.TripleWord]: AppGridItemTone.Bolder,
    }[bonus];
  });
  const block = $derived(runtime.findBlockInSlot(slotId));
  const blockIsSelected = $derived(block !== null && runtime.isBlockSelected(block.id));
  const blockTone = $derived.by(() => {
    if (block === null) return null;
    if (blockIsSelected) return AppGridItemTone.Bolder;
    if (block.wasUsedInPreviousTurn) return AppGridItemTone.Bold;
    return AppGridItemTone.Mid;
  });

  function handleDoublePressBoardBlock(blockId: PlayRuntimeBlockId): void {
    if (!runtime.isBlockInToolbar(blockId)) return;
    runtime.deselectBlock();
    void runtime.undoSlotBlock(blockId);
  }

  function handlePress(): void {
    if (block !== null) handlePressBoardBlock(block.id);
    else handlePressBoardSlot();
  }

  function handlePressBoardBlock(blockId: PlayRuntimeBlockId): void {
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

  function mapSlotBonusName(value: PlayRuntimeSlotBonus): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimeSlotBonus.DoubleLetter]: 'map_slot_bonus_name.dl',
          [PlayRuntimeSlotBonus.DoubleWord]: 'map_slot_bonus_name.dw',
          [PlayRuntimeSlotBonus.TripleLetter]: 'map_slot_bonus_name.tl',
          [PlayRuntimeSlotBonus.TripleWord]: 'map_slot_bonus_name.tw',
        } as const
      )[value],
    );
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
    text={bonus === null ? undefined : mapSlotBonusName(bonus)}
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
