<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { TransitionDuration } from '@/interface/enums.ts';
  import History from '@/interface/runes/history.svelte.ts';

  const log = new History();
</script>

{#if log.history.length > 0}
  <aside class="log" role="log">
    <ul class="log__list app__secondary">
      {#each log.history as entry (entry.key)}
        <li
          transition:fly|global={{ duration: TransitionDuration.Normal, x: '-1rem' }}
          animate:flip={{ duration: TransitionDuration.Normal }}
        >
          {@html entry.html}
        </li>
      {/each}
    </ul>
  </aside>
{/if}

<style>
  .log {
    --height: 7rem;
    position: absolute;
    top: calc(var(--height) * -1 - var(--padding-primary));
    right: var(--padding-primary);
    width: calc(100% - var(--padding-primary));

    .log__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-s);
      height: var(--height);
      padding-right: var(--padding-primary);
      overflow: hidden auto;
      text-align: right;
      border-right: 1px solid currentcolor;

      :global(em) {
        font-style: italic;
      }
    }
  }
</style>
