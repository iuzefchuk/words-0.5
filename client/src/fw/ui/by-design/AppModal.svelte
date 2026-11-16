<script lang="ts">
  import { tick } from 'svelte';
  import AppButton, { AppButtonAccent } from '@/client/src/fw/ui/by-design/AppButton.svelte';

  type Props = {
    body: string;
    cancelText: string;
    confirmText: string;
    isDestructive?: boolean;
    oncancel?: () => void;
    onconfirm?: () => void;
    title?: string | undefined;
  };

  const { body, cancelText, confirmText, isDestructive = false, oncancel, onconfirm, title }: Props = $props();

  const id = $props.id();
  const idTitle = `${id}-title`;
  const idBody = `${id}-body`;

  let refDialog: HTMLDialogElement | undefined;
  let cancelButton: { focus: () => void } | undefined;
  let confirmButton: { focus: () => void } | undefined;
  let lastFocusedElement: HTMLElement | null = null;
  let isShaking = $state(false);

  export function open(): void {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    void tick().then(() => {
      refDialog?.showModal();
      const target = isDestructive ? cancelButton : confirmButton;
      target?.focus();
    });
  }

  function close(): void {
    if (refDialog?.open === true) refDialog.close();
    lastFocusedElement?.focus();
    lastFocusedElement = null;
  }

  function handleCancel(): void {
    close();
    oncancel?.();
  }

  function handleConfirm(): void {
    close();
    onconfirm?.();
  }

  function onBackdropClick(event: MouseEvent): void {
    if (event.target === refDialog) shake();
  }

  function onCancel(event: Event): void {
    event.preventDefault();
    handleCancel();
  }

  function shake(): void {
    isShaking = true;
    setTimeout(() => {
      isShaking = false;
    }, 250);
  }
</script>

<dialog
  bind:this={refDialog}
  role="alertdialog"
  aria-modal="true"
  aria-labelledby={title !== undefined ? idTitle : undefined}
  aria-describedby={idBody}
  class="modal"
  class:modal--shaking={isShaking}
  onclick={onBackdropClick}
  oncancel={onCancel}
>
  <div class="modal__content">
    {#if title !== undefined}<h2 id={idTitle} class="modal__title">{title}</h2>{/if}
    <div id={idBody} class="modal__body">{@html body}</div>
  </div>
  <div class="modal__footer">
    <AppButton
      bind:this={cancelButton}
      accent={isDestructive ? AppButtonAccent.Primary : AppButtonAccent.Secondary}
      text={cancelText}
      ontrigger={handleCancel}
    />
    <AppButton
      bind:this={confirmButton}
      accent={isDestructive ? AppButtonAccent.Secondary : AppButtonAccent.Primary}
      text={confirmText}
      ontrigger={handleConfirm}
    />
  </div>
</dialog>

<style>
  .modal {
    flex-direction: column;
    gap: var(--space-2xl);
    max-width: min(28rem, calc(100vw - 2 * var(--space-l)));
    padding: var(--space-xl);
    color: var(--color-primary);
    color-scheme: dark;
    background: var(--bg-primary);
    border: none;
    border-radius: var(--space-s);
    box-shadow: var(--box-shadow-lvl-3);
    opacity: 0;
    transition:
      opacity var(--transition-duration-normal) var(--transition-timing-function),
      display var(--transition-duration-normal) allow-discrete,
      overlay var(--transition-duration-normal) allow-discrete;

    @media (prefers-color-scheme: dark) {
      color-scheme: light;
    }

    &[open] {
      display: flex;
      opacity: 1;

      @starting-style {
        opacity: 0;
      }
    }

    &::backdrop {
      background: oklch(100% 0 0deg / 30%);
      transition:
        background var(--transition-duration-normal) var(--transition-timing-function),
        display var(--transition-duration-normal) allow-discrete,
        overlay var(--transition-duration-normal) allow-discrete;

      @media (prefers-color-scheme: dark) {
        background: oklch(0% 0 0deg / 30%);
      }

      @starting-style {
        background: oklch(0% 0 0deg / 0%);
      }
    }

    &:not([open])::backdrop {
      background: oklch(0% 0 0deg / 0%);
    }
  }

  .modal--shaking {
    animation: horizontal-shake var(--transition-duration-normal) linear forwards;
  }

  .modal__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }

  .modal__title {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  .modal__body {
    font-size: var(--font-size-secondary);
    font-weight: var(--font-weight-secondary);
    color: var(--color-secondary);
    background: var(--bg-secondary);
  }

  .modal__footer {
    display: flex;
    flex-direction: row;
    gap: var(--space-m);
    justify-content: flex-end;
  }
</style>
