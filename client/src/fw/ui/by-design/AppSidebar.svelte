<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    ariaLabel: string;
    children: Snippet;
  };

  const { ariaLabel, children }: Props = $props();
</script>

<aside class="sidebar">
  <nav aria-label={ariaLabel} class="sidebar__nav">
    {@render children()}
  </nav>
</aside>

<style>
  .sidebar {
    box-sizing: border-box;
    width: calc(var(--space-6xl) * 7);
    max-width: 100%;
    height: 100%;
    padding: var(--space-s);
    overflow-y: auto;
    background: oklch(100% 0 0deg / 20%);
    box-shadow: var(--box-shadow-lvl-3);
    backdrop-filter: blur(var(--space-xs));
  }

  .sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-3xs);
  }
</style>
