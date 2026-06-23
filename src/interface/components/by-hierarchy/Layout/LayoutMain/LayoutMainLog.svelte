<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import History from '@/interface/runes/history.svelte.ts';

  const log = new History();
</script>

{#if log.history.length > 0}
  <aside class="log" role="log">
    <ul class="log__list app__make-secondary">
      {#each log.history as entry (entry.key)}
        <li transition:fly={{ duration: 250, x: -16 }} animate:flip={{ duration: 250 }}>{@html entry.html}</li>
      {/each}
    </ul>
  </aside>
{/if}

<style>
  .log {
    position: absolute;
    top: calc(var(--layout-main-log-height) * -1 - var(--layout-padding));
    right: var(--layout-padding);
    width: calc(100% - var(--layout-padding));
  }

  .log__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    height: var(--layout-main-log-height);
    padding-right: var(--layout-padding);
    overflow: hidden auto;
    text-align: right;
    border-right: 1px solid currentcolor;

    :global(em) {
      font-style: italic;
    }
  }
</style>
