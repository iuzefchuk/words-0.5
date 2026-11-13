export enum Sting {
  Arch = 'Arch',
  FallingArpeggio = 'FallingArpeggio',
  FallingFifth = 'FallingFifth',
  FallingThird = 'FallingThird',
  RisingArpeggio = 'RisingArpeggio',
  RisingFifth = 'RisingFifth',
  RisingThird = 'RisingThird',
}

export interface MediaPort {
  play(sting: Sting): void;
}
