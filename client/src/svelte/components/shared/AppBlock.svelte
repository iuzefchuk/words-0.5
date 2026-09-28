<script module lang="ts">
  export enum AppBlockElevation {
    High = 'High',
    Low = 'Low',
    Mid = 'Mid',
  }

  export enum AppBlockTone {
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
    | { elevation: AppBlockElevation.High; tone: AppBlockTone }
    | { elevation: AppBlockElevation.Low | AppBlockElevation.Mid; tone?: AppBlockTone | undefined }
  );

  const { ariaLabel, elevation, text, textSecondary, tone }: Props = $props();

  const textPosition = $derived(textSecondary === undefined ? '50%' : '45%');
</script>

<svg
  role="note"
  aria-hidden={text === undefined ? true : undefined}
  aria-label={ariaLabel}
  viewBox="0 0 40 40"
  class="block"
  class:block--elevation-low={elevation === AppBlockElevation.Low}
  class:block--elevation-mid={elevation === AppBlockElevation.Mid}
  class:block--elevation-high={elevation === AppBlockElevation.High}
  class:block--tone-faint={tone === AppBlockTone.Faint}
  class:block--tone-mid={tone === AppBlockTone.Mid}
  class:block--tone-bold={tone === AppBlockTone.Bold}
  class:block--tone-bolder={tone === AppBlockTone.Bolder}
>
  {#if text !== undefined}
    <text class="block__text" x={textPosition} y={textPosition} text-anchor="middle" dominant-baseline="central">{text}</text>
    {#if textSecondary !== undefined}
      <text class="block__text-secondary" x="78%" y="78%" text-anchor="middle" dominant-baseline="central">{textSecondary}</text>
    {/if}
  {/if}
</svg>

<style>
  .block {
    min-height: 100%;
    aspect-ratio: 1 / 1;
    user-select: none;
    border-radius: inherit;
  }

  .block__text {
    font-size: 15px;
    font-weight: var(--font-weight-big);
  }

  .block__text-secondary {
    font-size: 13px;
    color: light-dark(var(--color-level-4), var(--color-level-8));
  }

  .block--elevation-low {
    background: light-dark(var(--color-level-4), var(--color-level-8));
  }

  .block--elevation-mid {
    background: light-dark(var(--color-level-1), var(--color-level-10));

    @media (prefers-color-scheme: dark) {
      box-shadow: var(--shadow-level-0);
    }
  }

  .block--elevation-low,
  .block--elevation-mid {
    &.block--tone-faint {
      color: light-dark(var(--color-level-5), var(--color-level-8));
    }

    &.block--tone-mid {
      color: light-dark(var(--color-level-6), var(--color-level-7));
    }

    &.block--tone-bold {
      color: light-dark(var(--color-level-7), var(--color-level-6));
    }

    &.block--tone-bolder {
      color: light-dark(var(--color-level-8), var(--color-level-5));
    }
  }

  .block--elevation-high {
    position: relative;
    z-index: var(--z-index-level-1);
    color: light-dark(var(--color-level-3), var(--color-level-9));
    box-shadow: var(--shadow-level-1);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: background, color, outline;

    & .block__text {
      font-size: 22px;
    }

    &.block--tone-faint {
      background: light-dark(var(--color-level-5), var(--color-level-6));
    }

    &.block--tone-mid {
      background: light-dark(var(--color-level-6), var(--color-level-5));
    }

    &.block--tone-bold {
      background: light-dark(var(--color-level-7), var(--color-level-4));
    }

    &.block--tone-bolder {
      background: light-dark(var(--color-level-9), var(--color-level-2));
    }
  }
</style>
