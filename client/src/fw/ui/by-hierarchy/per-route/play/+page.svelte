<script lang="ts">
  import { PlayEngineType } from '@/client/src/domain/play.ts';
  import PlayRuntime from '@/client/src/fw/headless/runes/per-instance/PlayRuntime.svelte.ts';
  import Play from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import PlayLoader from '@/client/src/fw/ui/by-hierarchy/per-route/play/PlayLoader.svelte';

  let engineType = $state(PlayEngineType.Client);

  function setEngineType(newValue: PlayEngineType): void {
    if (newValue === engineType) return;
    engineType = newValue;
  }
</script>

{#key engineType}
  <svelte:boundary>
    {#snippet pending()}
      <div class="play" aria-busy="true">
        <PlayLoader />
      </div>
    {/snippet}
    {@const runtime = await PlayRuntime.create(engineType)}
    <Play {runtime} onsetenginetype={setEngineType} />
  </svelte:boundary>
{/key}

<style>
  .play {
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    gap: var(--space-s);
    place-items: center center;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
  }
</style>
