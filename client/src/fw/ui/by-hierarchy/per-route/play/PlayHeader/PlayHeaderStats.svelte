<script module lang="ts">
  import { PlayPlayer } from '@/client/src/domain/play.ts';
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  function mapPlayPlayer(player: PlayPlayer): string {
    return L10nGlobAdapter.t(
      (
        {
          [PlayPlayer.Opponent]: 'map_play_player.opponent',
          [PlayPlayer.User]: 'map_play_player.user',
        } as const
      )[player],
    );
  }
</script>

<script lang="ts">
  import animateNumber from '@/client/src/fw/headless/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';

  const runtime = getPlayRuntimeContext();

  const players = $derived([
    { name: mapPlayPlayer(PlayPlayer.User), score: runtime.userScore },
    { name: mapPlayPlayer(PlayPlayer.Opponent), score: runtime.opponentScore },
  ]);
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
    margin: 0;
  }

  .stats__desc {
    margin: 0;
  }

  .stats__row {
    display: flex;
    flex-direction: row;
    gap: var(--space-xs);
  }
</style>
