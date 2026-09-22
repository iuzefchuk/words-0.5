<script lang="ts">
  import { fade } from 'svelte/transition';
  import animateNumber from '@/interface/actions/animateNumber.ts';
  import { TransitionDuration } from '@/interface/enums.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer.ts';

  const t = TextLocalizer.namespace('game');
</script>

{#if main.tilesRemaining > 0}
  <p role="note" class="stats" transition:fade|global={{ duration: TransitionDuration.Short }}>
    <span use:animateNumber={{ number: main.tilesRemaining }} class="stats__number"></span>
    <span>{t('unassigned_count')}</span>
  </p>
{/if}

<style>
  .stats {
    display: flex;
    gap: var(--space-2xs);
    font-size: var(--font-size-secondary);
    font-weight: var(--font-weight-secondary);
    color: var(--color-secondary);
    user-select: none;
    background: var(--bg-secondary);
  }
</style>
