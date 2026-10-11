import type { PlayEventType } from '@/client/domain/enums/PlayEventType.ts';
import type { PlayPlayer } from '@/client/domain/enums/PlayPlayer.ts';

export type PlayEvent =
  | {
      readonly player: PlayPlayer;
      readonly score: number;
      readonly type: PlayEventType.TurnSaved;
      readonly words: ReadonlyArray<string>;
    }
  | { readonly player: PlayPlayer; readonly type: PlayEventType.TurnPassed }
  | { readonly type: PlayEventType.MatchFinished; readonly winner: null | PlayPlayer }
  | { readonly type: PlayEventType.MatchStarted }
  | { readonly type: PlayEventType.TurnValidationSet };
