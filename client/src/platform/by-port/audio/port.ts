export interface AudioPort {
  playPhrase(phrase: Phrase): void;
}

export type Phrase = ReadonlyArray<{
  duration: number;
  dynamic: number;
  pitch: number;
  waveform: 'sine' | 'square' | 'triangle';
}>;
