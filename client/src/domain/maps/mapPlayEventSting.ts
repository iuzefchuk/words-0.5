import { PlayEventType, PlayPlayer } from '@/client/domain/enums.ts';
import { Sting } from '@/client/services/AudioService.ts';
import type { PlayEvent } from '@/client/domain/types.ts';

export default function mapPlayEventSting(event: PlayEvent): null | Sting {
  switch (event.type) {
    case PlayEventType.MatchFinished:
      return event.winner === null ? Sting.Arch : event.winner === PlayPlayer.User ? Sting.RisingArpeggio : Sting.FallingArpeggio;
    case PlayEventType.MatchStarted:
    case PlayEventType.TurnValidationSet:
      return null;
    case PlayEventType.TurnPassed:
      return event.player === PlayPlayer.User ? Sting.FallingThird : Sting.FallingFifth;
    case PlayEventType.TurnSaved:
      return event.player === PlayPlayer.User ? Sting.RisingThird : Sting.RisingFifth;
  }
}
