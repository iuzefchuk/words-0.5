import type { TimelineEventType } from '@/server/domain/events/enums.ts';
import type { MatchPlayer } from '@/server/domain/value-objects/enums.ts';
import type { MatchSettings, TurnEvaluation, TurnPlacement } from '@/server/domain/value-objects/types.ts';

export type TimelineEvent =
  | {
      placement: TurnPlacement;
      player: MatchPlayer;
      score: number;
      type: TimelineEventType.TurnSaved;
      words: ReadonlyArray<string>;
    }
  | { player: MatchPlayer; type: TimelineEventType.TurnPassed }
  | { seed: number; settings: MatchSettings; type: TimelineEventType.MatchStarted }
  | { type: TimelineEventType.MatchFinished; winner: MatchPlayer | null }
  | { type: TimelineEventType.TurnValidationSet; value: TurnEvaluation };

export type TimelineProjection = {
  readonly eventList: ReadonlyArray<TimelineEvent>;
};
