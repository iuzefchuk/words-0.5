<script lang="ts">
  import { onMount } from 'svelte';
  import BootAlert from '@/interface/components/by-hierarchy/BootAlert.svelte';
  import BootProgress from '@/interface/components/by-hierarchy/BootProgress.svelte';
  import Dialog from '@/interface/components/by-hierarchy/Dialog.svelte';
  import Layout from '@/interface/components/by-hierarchy/Layout/Layout.svelte';
  import { TransitionDuration } from '@/interface/enums.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer.ts';

  const t = TextLocalizer.namespace('game');

  onMount(() => {
    void (async (): Promise<void> => {
      await main.initiate();
      if (main.appReady) user.initialize();
    })();
  });
</script>

<div
  style:display="contents"
  style:--transition-duration-long="{TransitionDuration.Long}ms"
  style:--transition-duration-normal="{TransitionDuration.Normal}ms"
  style:--transition-duration-short="{TransitionDuration.Short}ms"
>
  {#if main.bootError !== null}
    <BootAlert html={t('boot_error', { error: main.bootError })} />
  {:else if main.appReady}
    <Layout />
  {:else}
    <BootProgress />
  {/if}
  <Dialog />
</div>
