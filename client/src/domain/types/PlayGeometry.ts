import type { PlaySlotId } from '@/client/domain/types/PlaySlotId.ts';

export type PlayGeometry = {
  readonly adjacentsByCell: ReadonlyArray<ReadonlyArray<PlaySlotId>>;
  readonly centerCell: PlaySlotId;
  readonly columnByCell: ReadonlyArray<number>;
  readonly rowByCell: ReadonlyArray<number>;
};
