import type { PlayBlockId } from '@/client/domain/types/PlayBlockId.ts';
import type { PlayBlockLetter } from '@/client/domain/types/PlayBlockLetter.ts';

export type PlayBlock = {
  readonly id: PlayBlockId;
  readonly letter: PlayBlockLetter;
  readonly points: number;
  readonly wasUsedInPreviousTurn: boolean;
};
