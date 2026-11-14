import { PlaySlotBonus } from '@/client/src/domain/play.ts';
import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('map_play_slot_bonus');

export default function mapPlaySlotBonusJson(value: PlaySlotBonus): string {
  return L10nBundleAdapter.t(
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
