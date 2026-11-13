<script lang="ts">
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import PlayHeaderSettings from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayHeader/PlayHeaderSettings.svelte';
  import PlayHeaderStats from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayHeader/PlayHeaderStats.svelte';
  import type { PlayHostType } from '@/client/src/domain/play.ts';

  type Props = { onsethosttype: (hostType: PlayHostType) => void };

  const { onsethosttype }: Props = $props();

  const runtime = getPlayRuntimeContext();
</script>

<header class="header">
  {#if runtime.settingsAreChangeable}
    <PlayHeaderSettings {onsethosttype} />
  {:else}
    <PlayHeaderStats />
  {/if}
</header>

<style>
  .header {
    padding: var(--padding-primary);
  }
</style>
