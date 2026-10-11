import { PlaySlotBonus } from '@/client/domain/enums/PlaySlotBonus.ts';
import { AppGridItemTone } from '@/client/svelte/components/shared/AppGridItem.svelte';

export default function mapPlaySlotBonusAppGridItemTone(bonus: PlaySlotBonus): AppGridItemTone {
  return {
    [PlaySlotBonus.DoubleLetter]: AppGridItemTone.Faint,
    [PlaySlotBonus.DoubleWord]: AppGridItemTone.Bold,
    [PlaySlotBonus.TripleLetter]: AppGridItemTone.Mid,
    [PlaySlotBonus.TripleWord]: AppGridItemTone.Bolder,
  }[bonus];
}
