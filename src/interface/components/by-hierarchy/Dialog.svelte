<script lang="ts">
  import { tick } from 'svelte';
  import AppButton from '@/interface/components/app/AppButton.svelte';
  import { Accent } from '@/interface/enums.ts';
  import dialog, { DialogStatus } from '@/interface/runes/dialog.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer.ts';

  const ID_TITLE = 'title';
  const ID_HTML = 'html';
  const t = TextLocalizer.namespace('dialog');

  let refDialog: HTMLDialogElement | undefined;
  let cancelButton: { focus: () => void } | undefined;
  let confirmButton: { focus: () => void } | undefined;
  let lastFocusedElement: HTMLElement | null = null;
  let dialogIsShaking = $state(false);

  function emitResponse(status: DialogStatus): void {
    if (refDialog?.open === true) refDialog.close();
    dialog.resolve({ status });
    lastFocusedElement?.focus();
    lastFocusedElement = null;
  }

  function onBackdropClick(event: MouseEvent): void {
    if (event.target === refDialog) shake();
  }

  function onCancel(event: Event): void {
    event.preventDefault();
    emitResponse(DialogStatus.Canceled);
  }

  function shake(): void {
    dialogIsShaking = true;
    setTimeout(() => {
      dialogIsShaking = false;
    }, 250);
  }

  $effect(() => {
    if (dialog.html === null) return;
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    void tick().then(() => {
      refDialog?.showModal();
      const target = dialog.isDestructive ? cancelButton : confirmButton;
      target?.focus();
    });
  });
</script>

<dialog
  bind:this={refDialog}
  role="alertdialog"
  aria-modal="true"
  aria-labelledby={dialog.title !== null ? ID_TITLE : undefined}
  aria-describedby={ID_HTML}
  class="dialog"
  class:dialog--shaking={dialogIsShaking}
  onclick={onBackdropClick}
  oncancel={onCancel}
>
  <div class="dialog__content">
    {#if dialog.title !== null}<h2 id={ID_TITLE}>{dialog.title}</h2>{/if}
    <div id={ID_HTML} class="dialog__html">{@html dialog.html ?? ''}</div>
  </div>
  <div class="dialog__footer">
    <AppButton
      bind:this={cancelButton}
      accent={dialog.isDestructive ? Accent.Primary : Accent.Secondary}
      text={t('cancel')}
      ontrigger={() => { emitResponse(DialogStatus.Canceled); }}
    />
    <AppButton
      bind:this={confirmButton}
      accent={dialog.isDestructive ? Accent.Secondary : Accent.Primary}
      text={t('confirm')}
      ontrigger={() => { emitResponse(DialogStatus.Confirmed); }}
    />
  </div>
</dialog>

<style>
  .dialog {
    flex-direction: column;
    gap: var(--space-2xl);
    max-width: min(28rem, calc(100vw - 2 * var(--space-l)));
    padding: var(--space-xl);
    color: var(--color-primary);
    color-scheme: dark;
    background: var(--bg-primary);
    border: none;
    border-radius: var(--space-s);
    box-shadow: var(--shadow-level-3);
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
      background: oklch(0% 0 0deg / 20%);
      transition:
        background var(--transition-duration-normal) var(--transition-timing-function),
        display var(--transition-duration-normal) allow-discrete,
        overlay var(--transition-duration-normal) allow-discrete;

      @starting-style {
        background: oklch(0% 0 0deg / 0%);
      }
    }

    &:not([open])::backdrop {
      background: oklch(0% 0 0deg / 0%);
    }
  }

  .dialog--shaking {
    animation: horizontal-shake var(--transition-duration-normal) linear forwards;
  }

  .dialog__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }

  .dialog__html {
    font-size: var(--font-size-secondary);
    font-weight: var(--font-weight-secondary);
    color: var(--color-secondary);
    background: var(--bg-secondary);
  }

  .dialog__footer {
    display: flex;
    flex-direction: row;
    gap: var(--space-m);
    justify-content: flex-end;
  }
</style>
