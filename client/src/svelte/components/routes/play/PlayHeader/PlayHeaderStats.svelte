<script lang="ts">
  import { PlayPlayer } from '@/client/domain/enums.ts';
  import mapPlayPlayerJson from '@/client/domain/maps/mapPlayPlayerJson.ts';
  import animateNumber from '@/client/svelte/actions/animateNumber.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';

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
  }

  .stats__row {
    display: flex;
    flex-direction: row;
    gap: var(--space-xs);
  }
</style>
