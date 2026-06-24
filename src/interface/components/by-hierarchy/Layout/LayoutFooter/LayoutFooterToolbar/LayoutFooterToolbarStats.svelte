<script lang="ts">
  import { fade } from 'svelte/transition';
  import animateNumber from '@/interface/actions/AnimateNumber.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';
  import { TransitionDuration } from '@/interface/enums.ts';

  const t = TextLocalizer.namespace('game');
</script>

{#if mainStore.tilesRemaining > 0}
  <p role="note" class="stats app__secondary" transition:fade|global={{ duration: TransitionDuration.Short }}>
    <span class="app__hidden">{mainStore.tilesRemaining}</span>
    <span use:animateNumber={{ number: mainStore.tilesRemaining }} aria-hidden="true" class="stats__number"></span>
    <span>{t('unassigned_count')}</span>
  </p>
{/if}

<style>
  .stats {
    display: flex;
    gap: var(--space-2xs);
    user-select: none;
  }
</style>
