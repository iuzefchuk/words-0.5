import { DomainPlayfieldBonus } from '@/app/enums/index.ts';
import TextLocalizer from '@/interface/services/TextLocalizer.ts';

export default function getBonusName(bonus: DomainPlayfieldBonus): string {
  return TextLocalizer.text(
    {
      [DomainPlayfieldBonus.DoubleLetter]: 'game.bonus_dl',
      [DomainPlayfieldBonus.DoubleWord]: 'game.bonus_dw',
      [DomainPlayfieldBonus.TripleLetter]: 'game.bonus_tl',
      [DomainPlayfieldBonus.TripleWord]: 'game.bonus_tw',
    }[bonus],
  );
}
