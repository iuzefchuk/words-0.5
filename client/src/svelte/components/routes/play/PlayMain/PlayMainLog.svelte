<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { TransitionDuration } from '@/client/enums.ts';
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import { PlayRuntimeEventType, PlayRuntimePlayer } from '@/client/svelte/runes/PlayRuntime.svelte.ts';
  import type { PlayRuntimeEvent } from '@/client/svelte/runes/PlayRuntime.svelte.ts';

  const EVENTS_DISPLAYED_MAX = 3;

  const runtime = getPlayRuntimeContext();

  await Promise.all([I18nLibrary.loadNamespace('com_play_main_log'), I18nLibrary.loadNamespace('map_player_name')]);

  const entries = $derived.by(() => {
    const all = runtime.events.filter(isEventDisplayed);
    const start = Math.max(0, all.length - EVENTS_DISPLAYED_MAX);
    return all.slice(start).map((event, index) => ({ html: getEventText(event), key: start + index }));
  });

  function getEventText(event: PlayRuntimeEvent): string {
    switch (event.type) {
      case PlayRuntimeEventType.MatchFinished:
      case PlayRuntimeEventType.MatchStarted:
      case PlayRuntimeEventType.TurnValidationSet:
        return '';
      case PlayRuntimeEventType.TurnPassed:
        return I18nLibrary.t('com_play_main_log.pass', { player: mapPlayerName(event.player) });
      case PlayRuntimeEventType.TurnSaved:
        return I18nLibrary.t('com_play_main_log.save', {
          player: mapPlayerName(event.player),
          score: event.score,
          words: event.words.join(', '),
        });
    }
  }

  function isEventDisplayed(event: PlayRuntimeEvent): boolean {
    return event.type === PlayRuntimeEventType.TurnPassed || event.type === PlayRuntimeEventType.TurnSaved;
  }

  function mapPlayerName(player: PlayRuntimePlayer): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimePlayer.Opponent]: 'map_player_name.opponent',
          [PlayRuntimePlayer.User]: 'map_player_name.user',
        } as const
      )[player],
    );
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
