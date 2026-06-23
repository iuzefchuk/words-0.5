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
    box-shadow: var(--shadow-xs);
    transition-timing-function: var(--transition-timing-function);
    transition-duration: var(--transition-duration);
    transition-property: box-shadow;

    @media screen and (width <= 34rem) {
      width: 100%;
    }

    &:disabled {
      color: var(--btn-color-disabled);
      cursor: not-allowed;
      background: var(--btn-bg-disabled);
      border-color: var(--btn-border-color-disabled);
      box-shadow: none;
    }
  }

  .btn--primary {
    color: var(--btn-color-primary);
    background: var(--btn-bg-primary);
    border-color: var(--btn-border-color-primary);

    &:hover:not(:active, :disabled) {
      color: var(--btn-color-primary-hover);
      background: var(--btn-bg-primary-hover);
      border-color: var(--btn-border-color-primary-hover);
      box-shadow: var(--shadow-s);
    }

    &:active:not(:disabled) {
      color: var(--btn-color-primary-active);
      background: var(--btn-bg-primary-active);
      border-color: var(--btn-border-color-primary-active);
    }
  }

  .btn--secondary {
    color: var(--btn-color-secondary);
    background: var(--btn-bg-secondary);
    border-color: var(--btn-border-color-secondary);

    &:hover:not(:active, :disabled) {
      color: var(--btn-color-secondary-hover);
      background: var(--btn-bg-secondary-hover);
      border-color: var(--btn-border-color-secondary-hover);
      box-shadow: var(--shadow-s);
    }

    &:active:not(:disabled) {
      color: var(--btn-color-secondary-active);
      background: var(--btn-bg-secondary-active);
      border-color: var(--btn-border-color-secondary-active);
    }
  }
</style>
