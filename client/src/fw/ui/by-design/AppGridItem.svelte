<script module lang="ts">
  export enum AppGridItemElevation {
    High = 'High',
    Low = 'Low',
    Mid = 'Mid',
  }

  export enum AppGridItemTone {
    Bold = 'Bold',
    Bolder = 'Bolder',
    Faint = 'Faint',
    Mid = 'Mid',
  }
</script>

<script lang="ts">
  type Props = {
    ariaLabel?: string;
    text?: string | undefined;
    textSecondary?: string;
  } & (
    | { elevation: AppGridItemElevation.High; tone: AppGridItemTone }
    | { elevation: AppGridItemElevation.Low | AppGridItemElevation.Mid; tone?: AppGridItemTone | undefined }
  );

  const { ariaLabel, elevation, text, textSecondary, tone }: Props = $props();

  const textPosition = $derived(textSecondary === undefined ? '50%' : '45%');
</script>

<svg
  role="note"
  aria-hidden={text === undefined ? true : undefined}
  aria-label={ariaLabel}
  viewBox="0 0 40 40"
  class="grid-item"
  class:grid-item--elevation-low={elevation === AppGridItemElevation.Low}
  class:grid-item--elevation-mid={elevation === AppGridItemElevation.Mid}
  class:grid-item--elevation-high={elevation === AppGridItemElevation.High}
  class:grid-item--tone-faint={tone === AppGridItemTone.Faint}
  class:grid-item--tone-mid={tone === AppGridItemTone.Mid}
  class:grid-item--tone-bold={tone === AppGridItemTone.Bold}
  class:grid-item--tone-bolder={tone === AppGridItemTone.Bolder}
>
  {#if text !== undefined}
    <text class="grid-item__text" x={textPosition} y={textPosition} text-anchor="middle" dominant-baseline="central">{text}</text>
    {#if textSecondary !== undefined}
      <text class="grid-item__text-secondary" x="78%" y="78%" text-anchor="middle" dominant-baseline="central">{textSecondary}</text>
    {/if}
  {/if}
</svg>

<style>
  .grid-item {
    min-height: 100%;
    aspect-ratio: 1 / 1;
    user-select: none;
    border-radius: inherit;
  }

  .grid-item__text {
    font-size: 15px;
    font-weight: var(--font-weight-big);
  }

  .grid-item__text-secondary {
    font-size: 13px;
  }

  .grid-item--elevation-low {
    background: light-dark(var(--color-level-4), var(--color-level-8));
  }

  .grid-item--elevation-mid {
    background: light-dark(var(--color-level-1), var(--color-level-10));

    @media (prefers-color-scheme: dark) {
      box-shadow: var(--shadow-level-0);
    }
  }

  .grid-item--elevation-high {
    position: relative;
    z-index: var(--z-index-level-1);
    font-family: monospace;
    color: light-dark(var(--color-level-3), var(--color-level-9));
    box-shadow: var(--shadow-level-1);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: background, color, outline;

    & .grid-item__text {
      font-size: 25px;
    }

    &.grid-item--tone-faint {
      background: light-dark(var(--color-level-5), var(--color-level-6));
    }

    &.grid-item--tone-mid {
      background: light-dark(var(--color-level-6), var(--color-level-5));
    }

    &.grid-item--tone-bold {
      background: light-dark(var(--color-level-7), var(--color-level-4));
    }

    &.grid-item--tone-bolder {
      background: light-dark(var(--color-level-9), var(--color-level-2));
    }
  }

  .grid-item--elevation-low,
  .grid-item--elevation-mid {
    &.grid-item--tone-faint {
      color: light-dark(var(--color-level-5), var(--color-level-8));
    }

    &.grid-item--tone-mid {
      color: light-dark(var(--color-level-6), var(--color-level-7));
    }

    &.grid-item--tone-bold {
      color: light-dark(var(--color-level-7), var(--color-level-6));
    }

    &.grid-item--tone-bolder {
      color: light-dark(var(--color-level-8), var(--color-level-5));
    }
  }
</style>
