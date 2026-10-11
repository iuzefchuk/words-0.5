import { PlaySlotBonus } from '@/client/domain/enums.ts';
import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

await I18nLibrary.loadNamespace('map_play_slot_bonus');

export default function mapPlaySlotBonusJson(value: PlaySlotBonus): string {
  return I18nLibrary.t(
    (
      {
        [PlaySlotBonus.DoubleLetter]: 'map_play_slot_bonus.dl',
        [PlaySlotBonus.DoubleWord]: 'map_play_slot_bonus.dw',
        [PlaySlotBonus.TripleLetter]: 'map_play_slot_bonus.tl',
        [PlaySlotBonus.TripleWord]: 'map_play_slot_bonus.tw',
      } as const
    )[value],
  );
}
