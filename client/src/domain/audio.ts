import { PlayEventType, PlayPlayer } from '@/client/src/domain/play.ts';
import type { PlayEvent } from '@/client/src/domain/play.ts';

export enum Duration {
  ThirtySecond = 0.025,
  Sixteenth = 0.05,
  DottedSixteenth = 0.075,
  Eighth = 0.1,
  DottedEighth = 0.15,
  Quarter = 0.2,
}

export enum Dynamic {
  Pianissimo = 0.025,
  Piano = 0.05,
  MezzoPiano = 0.075,
  MezzoForte = 0.1,
  Forte = 0.15,
  Fortissimo = 0.2,
}

export enum Pitch {
  C4 = 261.63,
  G4 = 392,
  C5 = 523.25,
  E5 = 659.26,
  G5 = 783.99,
  C6 = 1046.5,
}

export enum Sting {
  Arch = 'Arch',
  FallingArpeggio = 'FallingArpeggio',
  FallingFifth = 'FallingFifth',
  FallingThird = 'FallingThird',
  RisingArpeggio = 'RisingArpeggio',
  RisingFifth = 'RisingFifth',
  RisingThird = 'RisingThird',
}

export enum Waveform {
  Sine = 'sine',
  Square = 'square',
  Triangle = 'triangle',
}

export type Note = { duration: Duration; dynamic: Dynamic; pitch: Pitch; waveform: Waveform };

export type Phrase = ReadonlyArray<Note>;

export const PHRASES_BY_STING: Record<Sting, Phrase> = {
  [Sting.Arch]: [
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.E5, waveform: Waveform.Square },
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.G5, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.Piano, pitch: Pitch.E5, waveform: Waveform.Square },
  ],
  [Sting.FallingArpeggio]: [
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.C5, waveform: Waveform.Square },
    { duration: Duration.DottedEighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G4, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.MezzoPiano, pitch: Pitch.C4, waveform: Waveform.Square },
  ],
  [Sting.FallingFifth]: [
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoForte, pitch: Pitch.G4, waveform: Waveform.Triangle },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.C4, waveform: Waveform.Triangle },
  ],
  [Sting.FallingThird]: [
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoForte, pitch: Pitch.E5, waveform: Waveform.Sine },
    { duration: Duration.Eighth, dynamic: Dynamic.Forte, pitch: Pitch.C5, waveform: Waveform.Sine },
  ],
  [Sting.RisingArpeggio]: [
    { duration: Duration.Eighth, dynamic: Dynamic.Piano, pitch: Pitch.C5, waveform: Waveform.Square },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.E5, waveform: Waveform.Square },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G5, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.MezzoForte, pitch: Pitch.C6, waveform: Waveform.Square },
  ],
  [Sting.RisingFifth]: [
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoForte, pitch: Pitch.C4, waveform: Waveform.Triangle },
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G4, waveform: Waveform.Triangle },
  ],
  [Sting.RisingThird]: [
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoForte, pitch: Pitch.C5, waveform: Waveform.Sine },
    { duration: Duration.Eighth, dynamic: Dynamic.Forte, pitch: Pitch.E5, waveform: Waveform.Sine },
  ],
};

export function mapPlayEventSting(event: PlayEvent): null | Sting {
  switch (event.type) {
    case PlayEventType.MatchFinished:
      return event.winner === null
        ? Sting.Arch
        : event.winner === PlayPlayer.User
          ? Sting.RisingArpeggio
          : Sting.FallingArpeggio;
    case PlayEventType.MatchStarted:
    case PlayEventType.TurnValidationSet:
      return null;
    case PlayEventType.TurnPassed:
      return event.player === PlayPlayer.User ? Sting.FallingThird : Sting.FallingFifth;
    case PlayEventType.TurnSaved:
      return event.player === PlayPlayer.User ? Sting.RisingThird : Sting.RisingFifth;
  }
}
