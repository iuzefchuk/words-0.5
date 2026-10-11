<script lang="ts">
  import Play from '@/client/svelte/components/routes/play/Play.svelte';
  import PlayLoader from '@/client/svelte/components/routes/play/PlayLoader.svelte';
  import PlayRuntime, { PlayRuntimeHostType } from '@/client/svelte/runes/PlayRuntime.svelte.ts';

  let hostType = $state(PlayRuntimeHostType.Client);

  function setHostType(newValue: PlayRuntimeHostType): void {
    if (newValue === hostType) return;
    hostType = newValue;
  }
</script>

{#key hostType}
  <svelte:boundary>
    {#snippet pending()}
      <div class="play" aria-busy="true">
        <PlayLoader />
      </div>
    {/snippet}
    {@const runtime = await PlayRuntime.create(hostType)}
    <Play {runtime} onsethosttype={setHostType} />
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
