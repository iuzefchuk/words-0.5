<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { PlayEventType } from '@/client/domain/enums/PlayEventType.ts';
  import mapPlayPlayerJson from '@/client/domain/maps/mapPlayPlayerJson.ts';
  import { TransitionDuration } from '@/client/enums.ts';
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import type { PlayEvent } from '@/client/domain/types/PlayEvent.ts';

  const EVENTS_DISPLAYED_MAX = 3;

  const runtime = getPlayRuntimeContext();

  await I18nLibrary.loadNamespace('com_play_main_log');

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
        return I18nLibrary.t('com_play_main_log.pass', { player: mapPlayPlayerJson(event.player) });
      case PlayEventType.TurnSaved:
        return I18nLibrary.t('com_play_main_log.save', {
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
      overflow: hidden auto;
      font-size: var(--font-size-secondary);
      font-weight: var(--font-weight-secondary);
      color: var(--color-secondary);
      text-align: right;
      background: var(--bg-secondary);
      border-right: 1px solid currentcolor;

      :global(em) {
        font-style: italic;
      }
    }
  }
</style>
