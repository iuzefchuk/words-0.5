<script lang="ts">
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import PlayHeaderSettings from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayHeader/PlayHeaderSettings.svelte';
  import PlayHeaderStats from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayHeader/PlayHeaderStats.svelte';
  import type { PlayEngineType } from '@/client/src/domain/play.ts';

  type Props = { onsetenginetype: (engineType: PlayEngineType) => void };

  const { onsetenginetype }: Props = $props();

  const runtime = getPlayRuntimeContext();
</script>

<header class="header">
  {#if runtime.settingsAreChangeable}
    <PlayHeaderSettings {onsetenginetype} />
  {:else}
    <PlayHeaderStats />
  {/if}
</header>

<style>
  .header {
    padding: var(--padding-primary);
  }
</style>
