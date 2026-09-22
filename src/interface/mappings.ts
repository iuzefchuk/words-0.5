import { DomainMatchPlayer, DomainPlayfieldBonus, DomainTimelineEventType } from '@/app/enums/index.ts';
import { Accent } from '@/interface/enums.ts';
import TextLocalizer from '@/interface/services/locales/TextLocalizer.ts';
import { Sound } from '@/interface/services/SoundPlayer.ts';
import type { DomainTimelineEvent } from '@/app/types/index.ts';

export function getBonusAccent(bonus: DomainPlayfieldBonus): Accent {
  return {
    [DomainPlayfieldBonus.DoubleLetter]: Accent.Quaternary,
    [DomainPlayfieldBonus.DoubleWord]: Accent.Secondary,
    [DomainPlayfieldBonus.TripleLetter]: Accent.Tertiary,
    [DomainPlayfieldBonus.TripleWord]: Accent.Primary,
  }[bonus];
}

export function getBonusName(bonus: DomainPlayfieldBonus): string {
  return TextLocalizer.text(
    {
      [DomainPlayfieldBonus.DoubleLetter]: 'game.bonus_dl',
      [DomainPlayfieldBonus.DoubleWord]: 'game.bonus_dw',
      [DomainPlayfieldBonus.TripleLetter]: 'game.bonus_tl',
      [DomainPlayfieldBonus.TripleWord]: 'game.bonus_tw',
    }[bonus],
  );
}

export function getEventSound(event: DomainTimelineEvent): null | Sound {
  switch (event.type) {
    case DomainTimelineEventType.MatchFinished:
      return event.winner === null
        ? Sound.GameLongNeutral
        : event.winner === DomainMatchPlayer.User
          ? Sound.GameLongGood
          : Sound.GameLongBad;
    case DomainTimelineEventType.MatchStarted:
    case DomainTimelineEventType.TurnValidationSet:
      return null;
    case DomainTimelineEventType.TurnPassed:
      return event.player === DomainMatchPlayer.User ? Sound.GameShortBad : Sound.GameShortAltBad;
    case DomainTimelineEventType.TurnSaved:
      return event.player === DomainMatchPlayer.User ? Sound.GameShortGood : Sound.GameShortAltGood;
  }
}