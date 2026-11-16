<script module lang="ts">
  export enum AppButtonAccent {
    Primary = 'Primary',
    Secondary = 'Secondary',
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  type Props = {
    accent: AppButtonAccent;
    isDisabled?: boolean;
    keys?: ReadonlyArray<string>;
    ontrigger?: () => void;
    text: string;
  };

  const { accent, isDisabled = false, keys = [], ontrigger, text }: Props = $props();

  let buttonEl: HTMLButtonElement | undefined;

  export function focus(): void {
    buttonEl?.focus();
  }

  function onClick(): void {
    ontrigger?.();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!keys.includes(event.key)) return;
    if (isDisabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    ontrigger?.();
  }

  onMount(() => {
    if (keys.length === 0) return;
    window.addEventListener('keydown', onKeydown, true);
    return () => {
      window.removeEventListener('keydown', onKeydown, true);
    };
  });
</script>

<button
  bind:this={buttonEl}
  class="btn"
  class:btn--primary={accent === AppButtonAccent.Primary}
  class:btn--secondary={accent === AppButtonAccent.Secondary}
  disabled={isDisabled}
  onclick={onClick}
>
  {text}
</button>

<style>
  .btn {
    display: grid;
    place-items: center;
    width: calc(var(--space-6xl) * 2);
    height: var(--space-5xl);
    padding: 0;
    font-family: inherit;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    text-align: center;
    appearance: none;
    cursor: pointer;
    user-select: none;
    border: 1px solid transparent;
    border-radius: var(--space-xs);
    box-shadow: var(--box-shadow-lvl-1);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration-short);
    transition-property: box-shadow;

    @media screen and (width <= 34rem) {
      width: 100%;
    }

    &:disabled {
      color: oklch(from var(--color-primary) l c h / 50%);
      cursor: not-allowed;
      background: transparent;
      border-color: oklch(from var(--color-primary) l c h / 30%);
      box-shadow: none;
    }
  }

  .btn--primary {
    color: light-dark(var(--color-lvl-1), var(--color-lvl-2));
    background: light-dark(var(--color-lvl-10), var(--color-lvl-9));
    border-color: transparent;

    &:hover:not(:active, :disabled) {
      color: var(--color-lvl-0);
      background: light-dark(var(--color-lvl-9), var(--color-lvl-11));
      border-color: transparent;
      box-shadow: var(--box-shadow-lvl-2);
    }

    &:active:not(:disabled) {
      color: light-dark(var(--color-lvl-3), var(--color-lvl-2));
      background: light-dark(var(--color-lvl-11), var(--color-lvl-8));
      border-color: transparent;
    }
  }

  .btn--secondary {
    color: var(--color-lvl-9);
    background: light-dark(var(--color-lvl-1), var(--color-lvl-4));
    border-color: var(--color-lvl-5);

    &:hover:not(:active, :disabled) {
      color: var(--color-lvl-11);
      background: light-dark(var(--color-lvl-0), var(--color-lvl-5));
      border-color: var(--color-lvl-11);
      box-shadow: var(--box-shadow-lvl-2);
    }

    &:active:not(:disabled) {
      color: var(--color-lvl-8);
      background: light-dark(var(--color-lvl-2), var(--color-lvl-3));
      border-color: var(--color-lvl-6);
    }
  }
</style>
