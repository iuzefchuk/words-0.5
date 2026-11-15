import type { AudioPort, Phrase } from '@/client/src/platform/by-port/audio/port.ts';

const LOOKAHEAD = 0.025;

const RELEASE = 0.025;

class SynthSequencer {
  private static context: AudioContext | undefined;

  private static nextNoteTime = 0;

  static schedule(phrase: Phrase): void {
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
      let start = Math.max(this.context.currentTime + LOOKAHEAD, this.nextNoteTime);
      for (const { duration, dynamic, pitch, waveform } of phrase) {
        const end = start + duration;
        const oscillator = new OscillatorNode(this.context, { frequency: pitch, type: waveform });
        const gainNode = new GainNode(this.context, { gain: dynamic });
        gainNode.gain.setValueAtTime(dynamic, end - RELEASE);
        gainNode.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(gainNode).connect(this.context.destination);
        oscillator.start(start);
        oscillator.stop(end);
        start = end;
      }
      this.nextNoteTime = start;
    } catch (error) {
      console.warn(error);
    }
  }
}

export default {
  playPhrase(phrase: Phrase): void {
    SynthSequencer.schedule(phrase);
  },
} satisfies AudioPort;
