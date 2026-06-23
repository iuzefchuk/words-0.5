<script lang="ts">
  import { Accent } from '@/interface/enums.ts';
  import type { DomainInventoryLetter } from '@/app/enums/index.ts';

  type Props = {
    accent: Accent;
    letter: DomainInventoryLetter;
    points: number;
  };

  const { accent, letter, points }: Props = $props();
</script>

<svg
  role="note"
  aria-label={`${letter} letter / ${points} pts`}
  viewBox="0 0 40 40"
  class="tile"
  class:tile--primary={accent === Accent.Primary}
  class:tile--secondary={accent === Accent.Secondary}
  class:tile--tertiary={accent === Accent.Tertiary}
>
  <text class="tile__letter" x="45%" y="45%" font-size="22" text-anchor="middle" dominant-baseline="central">{letter}</text>
  <text class="tile__points" x="78%" y="78%" font-size="13" text-anchor="middle" dominant-baseline="central">{points}</text>
</svg>

<style>
  .tile {
    position: relative;
    top: 0;
    left: 0;
    z-index: var(--z-index-level-1);
    display: block;
    min-height: 100%;
    aspect-ratio: 1 / 1;
    cursor: pointer;
    user-select: none;
    border-radius: inherit;
    box-shadow: var(--shadow-xs);
    fill: currentcolor;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-half);
    transition-property: background, color, outline;
  }

  .tile--primary {
    --tile-pts-color: var(--tile-pts-color-primary);

    color: var(--tile-color-primary);
    background: var(--tile-bg-primary);
  }

  .tile--secondary {
    --tile-pts-color: var(--tile-pts-color-secondary);

    color: var(--tile-color-secondary);
    background: var(--tile-bg-secondary);
  }

  .tile--tertiary {
    --tile-pts-color: var(--tile-pts-color-tertiary);

    color: var(--tile-color-tertiary);
    background: var(--tile-bg-tertiary);
  }

  .tile__letter {
    font-weight: var(--font-weight-big);
  }

  .tile__points {
    color: var(--tile-pts-color);
  }
</style>
