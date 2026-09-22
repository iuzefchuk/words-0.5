<script lang="ts">
  import animateNumber from '@/interface/actions/animateNumber.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer.ts';

  const t = TextLocalizer.namespace('game');

  const players = $derived([
    { name: t('player_user'), score: main.userScore },
    { name: t('player_opponent'), score: main.opponentScore },
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
