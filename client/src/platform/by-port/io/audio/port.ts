export enum AudioSting {
  Arch = 'Arch',
  FallingArpeggio = 'FallingArpeggio',
  FallingFifth = 'FallingFifth',
  FallingThird = 'FallingThird',
  RisingArpeggio = 'RisingArpeggio',
  RisingFifth = 'RisingFifth',
  RisingThird = 'RisingThird',
}

export interface AudioPort {
  play(sting: AudioSting): void;
}
