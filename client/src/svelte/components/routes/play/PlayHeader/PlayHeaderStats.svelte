<script lang="ts">
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import animateNumber from '@/client/svelte/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import { PlayRuntimePlayer } from '@/client/svelte/runes/PlayRuntime.svelte.ts';

  const runtime = getPlayRuntimeContext();

  await I18nLibrary.loadNamespace('map_player_name');

  const players = $derived([
    { name: mapPlayerName(PlayRuntimePlayer.User), score: runtime.userScore },
    { name: mapPlayerName(PlayRuntimePlayer.Opponent), score: runtime.opponentScore },
  ]);

  function mapPlayerName(player: PlayRuntimePlayer): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimePlayer.Opponent]: 'map_player_name.opponent',
          [PlayRuntimePlayer.User]: 'map_player_name.user',
        } as const
      )[player],
    );
  }
</script>

<dl class="stats">
  {#each players as player (player.name)}
    <div class="stats__row">
      <dt class="stats__title">{player.name}:</dt>
      <dd class="stats__desc">
        <span use:animateNumber={{ number: player.score }}></span>
      </dd>
    </div>
  {/each}
</dl>

<style>
  .stats {
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .stats__row {
    display: flex;
    flex-direction: row;
    gap: var(--space-xs);
  }
</style>
