import { DomainMatchPlayer, DomainTimelineEventType } from '@/app/enums/index.ts';
import main from '@/interface/runes/main.svelte.ts';
import TextLocalizer from '@/interface/services/TextLocalizer.ts';
import type { DomainTimelineEvent } from '@/app/types/index.ts';

export type HistoryEntry = { html: string; key: number };

export default class History {
  private static readonly MAX_DISPLAYED_EVENTS = 3;

  readonly history = $derived.by((): ReadonlyArray<HistoryEntry> => {
    const all = main.events.filter(History.isEventDisplayed);
    const start = Math.max(0, all.length - History.MAX_DISPLAYED_EVENTS);
    return all.slice(start).map((event, index) => ({ html: History.createEventHtml(event), key: start + index }));
  });

  private static createEventHtml(event: DomainTimelineEvent): string {
    switch (event.type) {
      case DomainTimelineEventType.MatchFinished:
      case DomainTimelineEventType.MatchStarted:
      case DomainTimelineEventType.TurnValidationSet:
        return '';
      case DomainTimelineEventType.TurnPassed:
        return History.getPassText(event.player);
      case DomainTimelineEventType.TurnSaved:
        return History.getSaveText(event.player, event.score, event.words);
    }
  }

  private static getPassText(player: DomainMatchPlayer): string {
    return player === DomainMatchPlayer.User
      ? TextLocalizer.text('game.event_pass_user')
      : TextLocalizer.text('game.event_pass_opponent');
  }

  private static getSaveText(player: DomainMatchPlayer, score: number, words: ReadonlyArray<string>): string {
    const joinedWords = words.join(', ');
    return player === DomainMatchPlayer.User
      ? TextLocalizer.text('game.event_save_user', { score, words: joinedWords })
      : TextLocalizer.text('game.event_save_opponent', { score, words: joinedWords });
  }

  private static isEventDisplayed(this: void, event: DomainTimelineEvent): boolean {
    return event.type === DomainTimelineEventType.TurnPassed || event.type === DomainTimelineEventType.TurnSaved;
  }
}
