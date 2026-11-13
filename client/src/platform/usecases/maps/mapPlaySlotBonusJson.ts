import { PlaySlotBonus } from '@/client/src/domain/play.ts';
import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

await I18nJsonAdapter.loadNamespace('map_play_slot_bonus');

export default function mapPlaySlotBonusJson(value: PlaySlotBonus): string {
  return I18nJsonAdapter.t(
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
