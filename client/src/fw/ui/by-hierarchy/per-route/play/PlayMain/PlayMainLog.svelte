<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { PlayEventType } from '@/client/src/domain/play.ts';
  import { TransitionDuration } from '@/client/src/fw/definitions/TransitionDuration.ts';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import comPlayMainLogJson from '@/client/src/platform/by-port/usecases/l10n/bundle/comPlayMainLogJson.ts';
  import mapPlayPlayerJson from '@/client/src/platform/by-port/usecases/l10n/bundle/mapPlayPlayerJson.ts';
  import type { PlayEvent } from '@/client/src/domain/play.ts';

  const EVENTS_DISPLAYED_MAX = 3;

  const runtime = getPlayRuntimeContext();

  const entries = $derived.by(() => {
    const all = runtime.events.filter(isEventDisplayed);
    const start = Math.max(0, all.length - EVENTS_DISPLAYED_MAX);
    return all.slice(start).map((event, index) => ({ html: getEventText(event), key: start + index }));
  });

  function getEventText(event: PlayEvent): string {
    switch (event.type) {
      case PlayEventType.MatchFinished:
      case PlayEventType.MatchStarted:
      case PlayEventType.TurnValidationSet:
        return '';
      case PlayEventType.TurnPassed:
        return comPlayMainLogJson('pass', { player: mapPlayPlayerJson(event.player) });
      case PlayEventType.TurnSaved:
        return comPlayMainLogJson('save', {
          player: mapPlayPlayerJson(event.player),
          score: event.score,
          words: event.words.join(', '),
        });
    }
  }

  function isEventDisplayed(event: PlayEvent): boolean {
    return event.type === PlayEventType.TurnPassed || event.type === PlayEventType.TurnSaved;
  }
</script>

{#if entries.length > 0}
  <aside class="log" role="log">
    <ul class="log__list">
      {#each entries as entry (entry.key)}
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
      padding-left: 0;
      margin: 0;
      overflow: hidden auto;
      font-size: var(--font-size-secondary);
      font-weight: var(--font-weight-secondary);
      color: var(--color-secondary);
      text-align: right;
      list-style: none;
      background: var(--bg-secondary);
      border-right: 1px solid currentcolor;

      :global(em) {
        font-style: italic;
      }
    }
  }
</style>
