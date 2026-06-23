<script lang="ts">
  import animateNumber from '@/interface/actions/AnimateNumber.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';

  const t = TextLocalizer.namespace('game');

  const players = $derived([
    { name: t('player_user'), score: mainStore.userScore },
    { name: t('player_opponent'), score: mainStore.opponentScore },
  ]);
</script>

<dl class="stats">
  {#each players as player (player.name)}
    <div class="stats__row">
      <dt class="stats__title">{player.name}:</dt>
      <dd class="stats__desc">
        <span class="app__make-sr-only">{player.score}</span>
        <span use:animateNumber={{ number: player.score }} aria-hidden="true"></span>
      </dd>
    </div>
  {/each}
</dl>

<style>
  .stats {
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-s);
  }

  .stats__row {
    display: flex;
    flex-direction: row;
    gap: var(--space-xs);
  }
</style>
