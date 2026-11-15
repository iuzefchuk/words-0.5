<script module lang="ts">
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  await Promise.all([
    L10nGlobAdapter.loadNamespace('com_play_header_settings'),
    L10nGlobAdapter.loadNamespace('com_play_main_log'),
    L10nGlobAdapter.loadNamespace('com_play_main_toolbar_stats'),
    L10nGlobAdapter.loadNamespace('com_play_menubar'),
    L10nGlobAdapter.loadNamespace('map_play_engine_type'),
    L10nGlobAdapter.loadNamespace('map_play_player'),
    L10nGlobAdapter.loadNamespace('map_play_settings_difficulty'),
    L10nGlobAdapter.loadNamespace('map_play_settings_type'),
    L10nGlobAdapter.loadNamespace('map_play_slot_bonus'),
  ]);
</script>

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
