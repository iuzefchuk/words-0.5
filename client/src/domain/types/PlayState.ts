import type { PlayResult } from '@/client/domain/enums/PlayResult.ts';
import type { PlayBlock } from '@/client/domain/types/PlayBlock.ts';
import type { PlayEvent } from '@/client/domain/types/PlayEvent.ts';
import type { PlaySettings } from '@/client/domain/types/PlaySettings.ts';
import type { PlaySlot } from '@/client/domain/types/PlaySlot.ts';

export type PlayState = {
  readonly cells: ReadonlyArray<PlaySlot>;
  readonly cellsPerAxis: number;
  readonly currentPlayerIsUser: boolean;
  readonly currentTurnIsValid: boolean;
  readonly currentTurnScore: null | number;
  readonly events: ReadonlyArray<PlayEvent>;
  readonly hasPriorTurns: boolean;
  readonly isFinished: boolean;
  readonly opponentScore: number;
  readonly opponentTurnIsDue: boolean;
  readonly result: PlayResult;
  readonly settings: PlaySettings;
  readonly settingsAreChangeable: boolean;
  readonly tilesPerPlayer: number;
  readonly tilesRemaining: number;
  readonly userPassWillBeResign: boolean;
  readonly userScore: number;
  readonly userTiles: ReadonlyArray<PlayBlock>;
};
