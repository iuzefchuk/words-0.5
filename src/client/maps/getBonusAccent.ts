import { Accent } from '@/client/enums.ts';
import { DomainPlayfieldBonus } from '@/server/app/enums/index.ts';

export default function getBonusAccent(bonus: DomainPlayfieldBonus): Accent {
  return {
    [DomainPlayfieldBonus.DoubleLetter]: Accent.Quaternary,
    [DomainPlayfieldBonus.DoubleWord]: Accent.Secondary,
    [DomainPlayfieldBonus.TripleLetter]: Accent.Tertiary,
    [DomainPlayfieldBonus.TripleWord]: Accent.Primary,
  }[bonus];
}
