export enum Sting {
  Arch = 'Arch',
  FallingArpeggio = 'FallingArpeggio',
  FallingFifth = 'FallingFifth',
  FallingThird = 'FallingThird',
  RisingArpeggio = 'RisingArpeggio',
  RisingFifth = 'RisingFifth',
  RisingThird = 'RisingThird',
}

enum Duration {
  ThirtySecond = 0.025,
  Sixteenth = 0.05,
  DottedSixteenth = 0.075,
  Eighth = 0.1,
  DottedEighth = 0.15,
  Quarter = 0.2,
}

enum Dynamic {
  Pianissimo = 0.025,
  Piano = 0.05,
  MezzoPiano = 0.075,
  MezzoForte = 0.1,
  Forte = 0.15,
  Fortissimo = 0.2,
}

enum Pitch {
  C4 = 261.63,
  G4 = 392,
  C5 = 523.25,
  E5 = 659.26,
  G5 = 783.99,
  C6 = 1046.5,
}

enum Waveform {
  Sine = 'sine',
  Square = 'square',
  Triangle = 'triangle',
}

type Note = { duration: Duration; dynamic: Dynamic; pitch: Pitch; waveform: Waveform };

type Phrase = ReadonlyArray<Note>;

export default class AudioService {
  private static readonly CONTEXT = new AudioContext();

  private static readonly LOOKAHEAD = 0.025;

  private static nextNoteTime = 0;

  private static readonly RELEASE = 0.025;

  private static readonly STINGS: Record<Sting, Phrase> = {
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

  static play(sting: Sting): void {
    const phrase = this.STINGS[sting];
    setTimeout(() => {
      this.playPhrase(phrase);
    }, 0);
  }

  private static playNote(note: Note, start: number, end: number): void {
    const { dynamic, pitch, waveform } = note;
    const oscillator = this.CONTEXT.createOscillator();
    const gainNode = this.CONTEXT.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = pitch;
    gainNode.gain.setValueAtTime(dynamic, start);
    gainNode.gain.setValueAtTime(dynamic, end - this.RELEASE);
    gainNode.gain.linearRampToValueAtTime(0, end);
    oscillator.connect(gainNode);
    gainNode.connect(this.CONTEXT.destination);
    oscillator.start(start);
    oscillator.stop(end);
  }

  private static playPhrase(phrase: Phrase): void {
    try {
      if (this.CONTEXT.state === 'suspended') void this.CONTEXT.resume();
      const earliest = this.CONTEXT.currentTime + this.LOOKAHEAD;
      let start = Math.max(earliest, this.nextNoteTime);
      for (const note of phrase) {
        const end = start + note.duration;
        this.playNote(note, start, end);
        start = end;
      }
      this.nextNoteTime = start;
    } catch {}
  }
}
