<script lang="ts">
  import { onMount } from 'svelte';
  import Alert from '@/interface/components/by-hierarchy/Alert.svelte';
  import Dialog from '@/interface/components/by-hierarchy/Dialog.svelte';
  import Layout from '@/interface/components/by-hierarchy/Layout/Layout.svelte';
  import Progress from '@/interface/components/by-hierarchy/Progress.svelte';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import userStore from '@/interface/runes/user.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';

  const t = TextLocalizer.namespace('game');

  onMount(() => {
    void (async (): Promise<void> => {
      await mainStore.initiate();
      if (mainStore.appReady) userStore.initialize();
    })();
  });
</script>

{#if mainStore.bootError !== null}
  <Alert html={t('boot_error', { error: mainStore.bootError })} />
{:else if mainStore.appReady}
  <Layout />
{:else}
  <Progress />
{/if}
<Dialog />
