<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = { children: Snippet; storyId: string };

  const { children, storyId }: Props = $props();

  const isSchemeFrame = new URLSearchParams(window.location.search).has('color-scheme');
</script>

{#if isSchemeFrame}
  <div class="story">{@render children()}</div>
{:else}
  <div class="split">
    {#each ['light', 'dark'] as colorScheme (colorScheme)}
      <iframe
        title={colorScheme}
        class="split__frame"
        style:color-scheme={colorScheme}
        src="iframe.html?id={storyId}&viewMode=story&color-scheme={colorScheme}"
      ></iframe>
    {/each}
  </div>
{/if}

<style>
  .story {
    box-sizing: border-box;
    display: grid;
    place-items: center;
    min-height: 100vh;
    padding: var(--space-l);
  }

  .split {
    display: grid;
    grid-template-rows: 1fr 1fr;
    height: 100vh;
  }

  .split__frame {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
