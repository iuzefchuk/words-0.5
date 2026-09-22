import { DomainPlayfieldBonus } from '@/app/enums/index.ts';
import { Accent } from '@/interface/enums.ts';

export default function getBonusAccent(bonus: DomainPlayfieldBonus): Accent {
  return {
    [DomainPlayfieldBonus.DoubleLetter]: Accent.Quaternary,
    [DomainPlayfieldBonus.DoubleWord]: Accent.Secondary,
    [DomainPlayfieldBonus.TripleLetter]: Accent.Tertiary,
    [DomainPlayfieldBonus.TripleWord]: Accent.Primary,
  }[bonus];
}
