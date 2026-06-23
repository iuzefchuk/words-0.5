<script lang="ts">
  import mainStore from '@/interface/runes/main.svelte.ts';

  type Props = { isFlipped?: boolean };

  const { isFlipped = false }: Props = $props();
  const SHIMMER_THRESHOLD = 29;

  const score = $derived(mainStore.currentTurnScore);
</script>

{#if score}
  <output class="tooltip" class:tooltip--flipped={isFlipped}>
    <span class="tooltip__value" class:tooltip__value--shimmer={score > SHIMMER_THRESHOLD}>{score}</span>
  </output>
{/if}

<style>
  .tooltip {
    position: absolute;
    top: calc(-1 * var(--space-xl));
    right: calc(-1 * var(--space-xl));
    z-index: var(--z-index-level-2);
    display: grid;
    place-items: center;
    width: var(--space-3xl);
    height: var(--space-3xl);
  }

  .tooltip--flipped {
    right: auto;
    left: calc(-1 * var(--space-xl));
  }

  .tooltip__value {
    padding: var(--space-4xs) var(--space-2xs);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight);
    color: light-dark(var(--color-level-1), var(--color-level-11));
    background: light-dark(var(--color-level-11), var(--color-level-0));
    border-radius: var(--space-3xs);
    box-shadow: var(--shadow-level-3);
  }

  .tooltip__value--shimmer {
    position: relative;
    overflow: hidden;
    isolation: isolate;

    &::before {
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 400%;
      content: '';
      background: linear-gradient(
        90deg,
        var(--palette-red-500),
        var(--palette-orange-500),
        var(--palette-yellow-500),
        var(--palette-green-500),
        var(--palette-cyan-500),
        var(--palette-blue-500),
        var(--palette-violet-500),
        var(--palette-red-500),
        var(--palette-orange-500),
        var(--palette-yellow-500),
        var(--palette-green-500),
        var(--palette-cyan-500),
        var(--palette-blue-500),
        var(--palette-violet-500),
        var(--palette-red-500)
      );
      background-size: 25% 100%;
      animation: shimmer 3s linear infinite;
      will-change: transform;
    }
  }
</style>
