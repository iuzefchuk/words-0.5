<script lang="ts">
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import PlayHeaderSettings from '@/client/svelte/components/routes/play/PlayHeader/PlayHeaderSettings.svelte';
  import PlayHeaderStats from '@/client/svelte/components/routes/play/PlayHeader/PlayHeaderStats.svelte';
  import type { PlayHostType } from '@/client/domain/enums/PlayHostType.ts';

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
