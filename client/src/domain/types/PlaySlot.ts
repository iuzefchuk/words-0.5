import type { PlaySlotBonus } from '@/client/domain/enums/PlaySlotBonus.ts';
import type { PlayBlock } from '@/client/domain/types/PlayBlock.ts';
import type { PlaySlotId } from '@/client/domain/types/PlaySlotId.ts';

export type PlaySlot = {
  readonly bonus: null | PlaySlotBonus;
  readonly id: PlaySlotId;
  readonly tile: null | PlayBlock;
};
