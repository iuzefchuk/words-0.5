import { AudioSting } from '@/client/src/platform/by-port/io/audio/port.ts';
import type { AudioPort } from '@/client/src/platform/by-port/io/audio/port.ts';

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

const CONTEXT = new AudioContext();

const LOOKAHEAD = 0.025;

const RELEASE = 0.025;

const STINGS: Record<AudioSting, Phrase> = {
  [AudioSting.Arch]: [
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.E5, waveform: Waveform.Square },
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.G5, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.Piano, pitch: Pitch.E5, waveform: Waveform.Square },
  ],
  [AudioSting.FallingArpeggio]: [
    { duration: Duration.DottedEighth, dynamic: Dynamic.Piano, pitch: Pitch.C5, waveform: Waveform.Square },
    { duration: Duration.DottedEighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G4, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.MezzoPiano, pitch: Pitch.C4, waveform: Waveform.Square },
  ],
  [AudioSting.FallingFifth]: [
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoForte, pitch: Pitch.G4, waveform: Waveform.Triangle },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.C4, waveform: Waveform.Triangle },
  ],
  [AudioSting.FallingThird]: [
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoForte, pitch: Pitch.E5, waveform: Waveform.Sine },
    { duration: Duration.Eighth, dynamic: Dynamic.Forte, pitch: Pitch.C5, waveform: Waveform.Sine },
  ],
  [AudioSting.RisingArpeggio]: [
    { duration: Duration.Eighth, dynamic: Dynamic.Piano, pitch: Pitch.C5, waveform: Waveform.Square },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.E5, waveform: Waveform.Square },
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G5, waveform: Waveform.Square },
    { duration: Duration.Quarter, dynamic: Dynamic.MezzoForte, pitch: Pitch.C6, waveform: Waveform.Square },
  ],
  [AudioSting.RisingFifth]: [
    { duration: Duration.Eighth, dynamic: Dynamic.MezzoForte, pitch: Pitch.C4, waveform: Waveform.Triangle },
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoPiano, pitch: Pitch.G4, waveform: Waveform.Triangle },
  ],
  [AudioSting.RisingThird]: [
    { duration: Duration.DottedSixteenth, dynamic: Dynamic.MezzoForte, pitch: Pitch.C5, waveform: Waveform.Sine },
    { duration: Duration.Eighth, dynamic: Dynamic.Forte, pitch: Pitch.E5, waveform: Waveform.Sine },
  ],
};

let nextNoteTime = 0;

function playNote(note: Note, start: number, end: number): void {
  const { dynamic, pitch, waveform } = note;
  const oscillator = CONTEXT.createOscillator();
  const gainNode = CONTEXT.createGain();
  oscillator.type = waveform;
  oscillator.frequency.value = pitch;
  gainNode.gain.setValueAtTime(dynamic, start);
  gainNode.gain.setValueAtTime(dynamic, end - RELEASE);
  gainNode.gain.linearRampToValueAtTime(0, end);
  oscillator.connect(gainNode);
  gainNode.connect(CONTEXT.destination);
  oscillator.start(start);
  oscillator.stop(end);
}

function playPhrase(phrase: Phrase): void {
  try {
    if (CONTEXT.state === 'suspended') void CONTEXT.resume();
    const earliest = CONTEXT.currentTime + LOOKAHEAD;
    let start = Math.max(earliest, nextNoteTime);
    for (const note of phrase) {
      const end = start + note.duration;
      playNote(note, start, end);
      start = end;
    }
    nextNoteTime = start;
  } catch (error) {
    console.warn('AudioSynthAdapter:', error);
  }
}

export default {
  play(sting: AudioSting): void {
    const phrase = STINGS[sting];
    setTimeout(() => {
      playPhrase(phrase);
    }, 0);
  },
} satisfies AudioPort;
