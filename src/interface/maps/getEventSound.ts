import { DomainMatchPlayer, DomainTimelineEventType } from '@/app/enums/index.ts';
import { Sound } from '@/interface/services/SoundPlayer.ts';
import type { DomainTimelineEvent } from '@/app/types/index.ts';

export default function getEventSound(event: DomainTimelineEvent): null | Sound {
  switch (event.type) {
    case DomainTimelineEventType.MatchFinished:
      return event.winner === null
        ? Sound.GameLongNeutral
        : event.winner === DomainMatchPlayer.User
          ? Sound.GameLongGood
          : Sound.GameLongBad;
    case DomainTimelineEventType.MatchStarted:
    case DomainTimelineEventType.TurnValidationSet:
      return null;
    case DomainTimelineEventType.TurnPassed:
      return event.player === DomainMatchPlayer.User ? Sound.GameShortBad : Sound.GameShortAltBad;
    case DomainTimelineEventType.TurnSaved:
      return event.player === DomainMatchPlayer.User ? Sound.GameShortGood : Sound.GameShortAltGood;
  }
}
