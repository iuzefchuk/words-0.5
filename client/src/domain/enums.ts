export enum PlayEventType {
  MatchFinished = 'MatchFinished',
  MatchStarted = 'MatchStarted',
  TurnPassed = 'TurnPassed',
  TurnSaved = 'TurnSaved',
  TurnValidationSet = 'TurnValidationSet',
}

export enum PlayHostType {
  Client = 'Client',
  Server = 'Server',
}

export enum PlayPlayer {
  Opponent = 'Opponent',
  User = 'User',
}

export enum PlayResult {
  Lose = 'Lose',
  Tie = 'Tie',
  Undecided = 'Undecided',
  Win = 'Win',
}

export enum PlaySettingsDifficulty {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum PlaySettingsType {
  Classic = 'Classic',
  Random = 'Random',
}

export enum PlaySlotBonus {
  DoubleLetter = 'DoubleLetter',
  DoubleWord = 'DoubleWord',
  TripleLetter = 'TripleLetter',
  TripleWord = 'TripleWord',
}
