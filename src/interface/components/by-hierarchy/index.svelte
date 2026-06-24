<script lang="ts">
  import { onMount } from 'svelte';
  import { TransitionDuration } from '@/interface/enums.ts';
  import BootAlert from '@/interface/components/by-hierarchy/BootAlert.svelte';
  import Dialog from '@/interface/components/by-hierarchy/Dialog.svelte';
  import Layout from '@/interface/components/by-hierarchy/Layout/Layout.svelte';
  import BootProgress from '@/interface/components/by-hierarchy/BootProgress.svelte';
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

<div
  style:display="contents"
  style:--transition-duration-long="{TransitionDuration.Long}ms"
  style:--transition-duration-normal="{TransitionDuration.Normal}ms"
  style:--transition-duration-short="{TransitionDuration.Short}ms"
>
  {#if mainStore.bootError !== null}
    <BootAlert html={t('boot_error', { error: mainStore.bootError })} />
  {:else if mainStore.appReady}
    <Layout />
  {:else}
    <BootProgress />
  {/if}
  <Dialog />
</div>
