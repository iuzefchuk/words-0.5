<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = { children?: Snippet };

  const { children }: Props = $props();
</script>

<div class="skeleton" aria-hidden="true">{@render children?.()}</div>

<style>
  .skeleton {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: light-dark(var(--color-level-4), var(--color-level-8));
    border-radius: inherit;

    &::after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(-100cqw - var(--skeleton-offset, 0px));
      width: 300cqw;
      content: '';
      background-image: linear-gradient(
        90deg,
        transparent 0%,
        light-dark(var(--color-level-3), var(--color-level-7)) 75%,
        transparent 100%
      );
      background-repeat: no-repeat;
      background-size: 100cqw 100%;
      animation: horizontal-sweep 1s var(--transition-timing-function) infinite;
    }
  }
</style>
