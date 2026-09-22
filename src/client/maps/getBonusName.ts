import TextLocalizer from '@/client/services/TextLocalizer.ts';
import { DomainPlayfieldBonus } from '@/server/app/enums/index.ts';

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
