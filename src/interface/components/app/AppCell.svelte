<script lang="ts">
  import { Accent } from '@/interface/enums.ts';
  import { getBonusAccent, getBonusName } from '@/interface/mappings.ts';
  import type { DomainPlayfieldBonus } from '@/app/enums/index.ts';
  import type { Snippet } from 'svelte';

  type Props = {
    bonus: DomainPlayfieldBonus | null;
    children?: Snippet;
    colIndex: number;
    isFocused: boolean;
    isHighlighted: boolean;
    isOccupied: boolean;
    onactivate?: () => void;
    ondoubleActivate?: () => void;
    rowIndex: number;
  };

  const { bonus, children, colIndex, isFocused, isHighlighted, isOccupied, onactivate, ondoubleActivate, rowIndex }: Props =
    $props();

  const bonusAccent = $derived(bonus === null ? undefined : getBonusAccent(bonus));

  function onClick(event: MouseEvent): void {
    event.stopPropagation();
    onactivate?.();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    onactivate?.();
  }

  function onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    ondoubleActivate?.();
  }
</script>

<button
  role="gridcell"
  tabindex={isFocused ? 0 : -1}
  aria-rowindex={rowIndex}
  aria-colindex={colIndex}
  aria-label={!isOccupied && bonus === null ? `Row ${rowIndex}, Column ${colIndex}, empty` : undefined}
  class="cell"
  class:cell--highlighted={isHighlighted}
  class:cell--occupied={isOccupied}
  onclick={onClick}
  onkeydown={onKeydown}
  ondblclick={onDoubleClick}
>
  {#if bonus !== null}
    <svg
      role="note"
      viewBox="0 0 40 40"
      class="cell__bonus"
      class:cell__bonus--primary={bonusAccent === Accent.Primary}
      class:cell__bonus--secondary={bonusAccent === Accent.Secondary}
      class:cell__bonus--tertiary={bonusAccent === Accent.Tertiary}
      class:cell__bonus--quaternary={bonusAccent === Accent.Quaternary}
    >
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">{getBonusName(bonus)}</text>
    </svg>
  {/if}
  {@render children?.()}
</button>

<style>
  .cell {
    display: grid;
    grid-area: auto;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
    max-width: var(--space-4xl);
    aspect-ratio: 1 / 1;
    cursor: pointer;
    user-select: none;
    background: light-dark(var(--color-level-1), var(--color-level-10));
    border-radius: var(--radius-grid);
    box-shadow: light-dark(none, var(--shadow-level-0));

    & > * {
      grid-area: 1 / 1;
    }
  }

  .cell--highlighted {
    background: light-dark(var(--color-level-4), var(--color-level-8));
  }

  .cell--highlighted,
  .cell--occupied {
    box-shadow: none;
  }

  .cell__bonus {
    z-index: var(--z-index-level-1);
    font-size: 15px;
    font-weight: var(--font-weight-big);
    opacity: var(--cell-opacity-bonus);
  }

  .cell__bonus--primary text {
    fill: light-dark(var(--color-level-8), var(--color-level-5));
  }

  .cell__bonus--secondary text {
    fill: light-dark(var(--color-level-7), var(--color-level-6));
  }

  .cell__bonus--tertiary text {
    fill: light-dark(var(--color-level-6), var(--color-level-7));
  }

  .cell__bonus--quaternary text {
    fill: light-dark(var(--color-level-5), var(--color-level-8));
  }
</style>
