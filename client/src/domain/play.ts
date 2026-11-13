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

export type PlayBlock = {
  readonly id: PlayBlockId;
  readonly letter: PlayBlockLetter;
  readonly points: number;
  readonly wasUsedInPreviousTurn: boolean;
};

export type PlayBlockId = string;

export type PlayBlockLetter = string;

export type PlayEvent =
  | {
      readonly player: PlayPlayer;
      readonly score: number;
      readonly type: PlayEventType.TurnSaved;
      readonly words: ReadonlyArray<string>;
    }
  | { readonly player: PlayPlayer; readonly type: PlayEventType.TurnPassed }
  | { readonly type: PlayEventType.MatchFinished; readonly winner: null | PlayPlayer }
  | { readonly type: PlayEventType.MatchStarted }
  | { readonly type: PlayEventType.TurnValidationSet };

export type PlayGeometry = {
  readonly adjacentsByCell: ReadonlyArray<ReadonlyArray<PlaySlotId>>;
  readonly centerCell: PlaySlotId;
  readonly columnByCell: ReadonlyArray<number>;
  readonly rowByCell: ReadonlyArray<number>;
};

export type PlaySettings = {
  readonly difficulty: PlaySettingsDifficulty;
  readonly type: PlaySettingsType;
};

export type PlaySlot = {
  readonly bonus: null | PlaySlotBonus;
  readonly id: PlaySlotId;
  readonly tile: null | PlayBlock;
};

export type PlaySlotId = number;

export type PlayState = {
  readonly cells: ReadonlyArray<PlaySlot>;
  readonly cellsPerAxis: number;
  readonly currentPlayerIsUser: boolean;
  readonly currentTurnIsValid: boolean;
  readonly currentTurnScore: null | number;
  readonly events: ReadonlyArray<PlayEvent>;
  readonly hasPriorTurns: boolean;
  readonly isFinished: boolean;
  readonly opponentScore: number;
  readonly opponentTurnIsDue: boolean;
  readonly result: PlayResult;
  readonly settings: PlaySettings;
  readonly settingsAreChangeable: boolean;
  readonly tilesPerPlayer: number;
  readonly tilesRemaining: number;
  readonly userPassWillBeResign: boolean;
  readonly userScore: number;
  readonly userTiles: ReadonlyArray<PlayBlock>;
};
