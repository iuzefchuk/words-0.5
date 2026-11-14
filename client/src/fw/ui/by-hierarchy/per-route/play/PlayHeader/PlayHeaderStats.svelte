<script lang="ts">
  import { PlayPlayer } from '@/client/src/domain/play.ts';
  import animateNumber from '@/client/src/fw/headless/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import mapPlayPlayerJson from '@/client/src/platform/by-port/usecases/l10n/bundle/mapPlayPlayerJson.ts';

  const runtime = getPlayRuntimeContext();

  const players = $derived([
    { name: mapPlayPlayerJson(PlayPlayer.User), score: runtime.userScore },
    { name: mapPlayPlayerJson(PlayPlayer.Opponent), score: runtime.opponentScore },
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
