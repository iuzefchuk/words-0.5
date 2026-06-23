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
    box-shadow: var(--shadow-level-1);
    fill: currentcolor;
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: background, color, outline;
  }

  .tile--primary {
    --tile-pts-color: light-dark(var(--color-level-4), var(--color-level-8));
    color: light-dark(var(--color-level-3), var(--color-level-9));
    background: light-dark(var(--color-level-9), var(--color-level-2));
  }

  .tile--secondary {
    --tile-pts-color: light-dark(var(--color-level-4), var(--color-level-8));
    color: light-dark(var(--color-level-3), var(--color-level-9));
    background: light-dark(var(--color-level-7), var(--color-level-4));
  }

  .tile--tertiary {
    --tile-pts-color: light-dark(var(--color-level-4), var(--color-level-8));
    color: light-dark(var(--color-level-3), var(--color-level-9));
    background: light-dark(var(--color-level-6), var(--color-level-5));
  }

  .tile__letter {
    font-weight: var(--font-weight-big);
  }

  .tile__points {
    color: var(--tile-pts-color);
  }
</style>
