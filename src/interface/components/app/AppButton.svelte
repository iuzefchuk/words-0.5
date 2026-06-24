<script lang="ts">
  import { onMount } from 'svelte';
  import { Accent } from '@/interface/enums.ts';
  import dialogStore from '@/interface/runes/dialog.svelte.ts';

  type Props = {
    accent: Accent;
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
    if (dialogStore.isOpen) return;
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
  class:btn--primary={accent === Accent.Primary}
  class:btn--secondary={accent === Accent.Secondary}
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
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    text-align: center;
    cursor: pointer;
    user-select: none;
    border: 1px solid transparent;
    border-radius: var(--space-xs);
    box-shadow: var(--shadow-level-1);
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
    color: light-dark(var(--color-level-1), var(--color-level-9));
    background: light-dark(var(--color-level-10), var(--color-level-2));
    border-color: transparent;

    &:hover:not(:active, :disabled) {
      color: light-dark(var(--color-level-0), var(--color-level-11));
      background: light-dark(var(--color-level-9), var(--color-level-0));
      border-color: transparent;
      box-shadow: var(--shadow-level-2);
    }

    &:active:not(:disabled) {
      color: light-dark(var(--color-level-3), var(--color-level-9));
      background: light-dark(var(--color-level-11), var(--color-level-3));
      border-color: transparent;
    }
  }

  .btn--secondary {
    color: light-dark(var(--color-level-9), var(--color-level-2));
    background: light-dark(var(--color-level-1), var(--color-level-7));
    border-color: light-dark(var(--color-level-5), var(--color-level-6));

    &:hover:not(:active, :disabled) {
      color: light-dark(var(--color-level-11), var(--color-level-0));
      background: light-dark(var(--color-level-0), var(--color-level-6));
      border-color: light-dark(var(--color-level-11), var(--color-level-0));
      box-shadow: var(--shadow-level-2);
    }

    &:active:not(:disabled) {
      color: light-dark(var(--color-level-8), var(--color-level-3));
      background: light-dark(var(--color-level-2), var(--color-level-8));
      border-color: light-dark(var(--color-level-6), var(--color-level-5));
    }
  }
</style>
