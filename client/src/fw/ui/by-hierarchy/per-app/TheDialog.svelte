<script module lang="ts">
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  function comTheDialog(key: string, props?: Record<string, number | string>): string {
    return L10nGlobAdapter.t(`com_the_dialog.${key}`, props);
  }
</script>

<script lang="ts">
  import dialog, { TheDialogStatus } from '@/client/src/fw/headless/runes/per-app/for-component/TheDialog.svelte.ts';
  import AppModal from '@/client/src/fw/ui/by-design/AppModal.svelte';

  let modal: { open: () => void } | undefined;

  $effect(() => {
    if (dialog.body === null) return;
    modal?.open();
  });
</script>

<AppModal
  bind:this={modal}
  body={dialog.body ?? ''}
  cancelText={comTheDialog('btn_cancel')}
  confirmText={comTheDialog('btn_confirm')}
  isDestructive={dialog.isDestructive}
  title={dialog.title ?? undefined}
  oncancel={() => {
    dialog.resolve({ status: TheDialogStatus.Canceled });
  }}
  onconfirm={() => {
    dialog.resolve({ status: TheDialogStatus.Confirmed });
  }}
/>
