<script lang="ts">
  import { onMount } from 'svelte';
  import BootAlert from '@/client/components/by-hierarchy/BootAlert.svelte';
  import BootProgress from '@/client/components/by-hierarchy/BootProgress.svelte';
  import Dialog from '@/client/components/by-hierarchy/Dialog.svelte';
  import Layout from '@/client/components/by-hierarchy/Layout/Layout.svelte';
  import { TransitionDuration } from '@/client/enums.ts';
  import main from '@/client/runes/main.svelte.ts';
  import user from '@/client/runes/user.svelte.ts';
  import TextLocalizer from '@/client/services/TextLocalizer.ts';

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
