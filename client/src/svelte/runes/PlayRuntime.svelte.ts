import { updated } from '$app/state';
import AudioService, { Sting } from '@/client/services/AudioService.ts';
import CryptoService from '@/client/services/CryptoService.ts';
import DatabaseService, { DatabaseName } from '@/client/services/DatabaseService.ts';
import FetchService from '@/client/services/FetchService.ts';
import App from '@/engine/app/App.ts';
import { DomainMatchDifficulty, DomainMatchType } from '@/engine/app/enums/index.ts';
import dictionaryUrl from '@/engine/assets/dictionary.bin?url';
import { eventsSchemaVersion } from '@/engine/domain/events/constants.ts';
import main from '@/engine/main.ts';
import type { DomainTimelineEvent } from '@/engine/app/types/index.ts';

export enum PlayRuntimeEventType {
  MatchFinished = 'MatchFinished',
  MatchStarted = 'MatchStarted',
  TurnPassed = 'TurnPassed',
  TurnSaved = 'TurnSaved',
  TurnValidationSet = 'TurnValidationSet',
}

export enum PlayRuntimeHostType {
  Client = 'Client',
  Server = 'Server',
}

export enum PlayRuntimePlayer {
  Opponent = 'Opponent',
  User = 'User',
}

export enum PlayRuntimeResult {
  Lose = 'Lose',
  Tie = 'Tie',
  Undecided = 'Undecided',
  Win = 'Win',
}

export enum PlayRuntimeSettingsDifficulty {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum PlayRuntimeSettingsType {
  Classic = 'Classic',
  Random = 'Random',
}

export enum PlayRuntimeSlotBonus {
  DoubleLetter = 'DoubleLetter',
  DoubleWord = 'DoubleWord',
  TripleLetter = 'TripleLetter',
  TripleWord = 'TripleWord',
}

export type PlayRuntimeBlock = {
  readonly id: PlayRuntimeBlockId;
  readonly letter: PlayRuntimeBlockLetter;
  readonly points: number;
  readonly wasUsedInPreviousTurn: boolean;
};

export type PlayRuntimeBlockId = string;

export type PlayRuntimeBlockLetter = string;

export type PlayRuntimeConfig = {
  readonly hostType: PlayRuntimeHostType;
  readonly settings: null | PlayRuntimeSettings;
};

export type PlayRuntimeEvent =
  | {
      readonly player: PlayRuntimePlayer;
      readonly score: number;
      readonly type: PlayRuntimeEventType.TurnSaved;
      readonly words: ReadonlyArray<string>;
    }
  | { readonly player: PlayRuntimePlayer; readonly type: PlayRuntimeEventType.TurnPassed }
  | { readonly type: PlayRuntimeEventType.MatchFinished; readonly winner: null | PlayRuntimePlayer }
  | { readonly type: PlayRuntimeEventType.MatchStarted }
  | { readonly type: PlayRuntimeEventType.TurnValidationSet };

export type PlayRuntimeSettings = {
  readonly difficulty: PlayRuntimeSettingsDifficulty;
  readonly type: PlayRuntimeSettingsType;
};

export type PlayRuntimeSlotId = number;

type PlayRuntimeGeometry = {
  readonly adjacentsByCell: ReadonlyArray<ReadonlyArray<PlayRuntimeSlotId>>;
  readonly centerCell: PlayRuntimeSlotId;
  readonly columnByCell: ReadonlyArray<number>;
  readonly rowByCell: ReadonlyArray<number>;
};

type PlayRuntimeSlot = {
  readonly bonus: null | PlayRuntimeSlotBonus;
  readonly id: PlayRuntimeSlotId;
  readonly tile: null | PlayRuntimeBlock;
};

type PlayRuntimeState = {
  readonly cells: ReadonlyArray<PlayRuntimeSlot>;
  readonly cellsPerAxis: number;
  readonly currentPlayerIsUser: boolean;
  readonly currentTurnIsValid: boolean;
  readonly currentTurnScore: null | number;
  readonly events: ReadonlyArray<PlayRuntimeEvent>;
  readonly hasPriorTurns: boolean;
  readonly isFinished: boolean;
  readonly opponentScore: number;
  readonly opponentTurnIsDue: boolean;
  readonly result: PlayRuntimeResult;
  readonly settings: PlayRuntimeSettings;
  readonly settingsAreChangeable: boolean;
  readonly tilesPerPlayer: number;
  readonly tilesRemaining: number;
  readonly userPassWillBeResign: boolean;
  readonly userScore: number;
  readonly userTiles: ReadonlyArray<PlayRuntimeBlock>;
};

class ClientHost {
  private constructor(private readonly app: App) {}

  static async open(settings: null | PlayRuntimeSettings): Promise<ClientHost> {
    const [dictionary, events] = await Promise.all([
      FetchService.getArrayBuffer(dictionaryUrl),
      DatabaseService.load(DatabaseName.PlayRuntimeEvents, eventsSchemaVersion),
    ]);
    const app = App.open(
      main(dictionary),
      events as null | ReadonlyArray<DomainTimelineEvent>,
      settings === null ? null : { difficulty: DomainMatchDifficulty[settings.difficulty], type: DomainMatchType[settings.type] },
      CryptoService.createSeed(),
    );
    if (app.queries.opponentTurnIsDue) app.commands.playOpponentTurn();
    const host = new ClientHost(app);
    await host.persist();
    return host;
  }

  async changeSettings(settings: Partial<PlayRuntimeSettings>): Promise<PlayRuntimeState> {
    if (settings.difficulty !== undefined) {
      this.app.commands.changeMatchDifficulty(DomainMatchDifficulty[settings.difficulty]);
    }
    if (settings.type !== undefined) {
      this.app.commands.changeMatchType(DomainMatchType[settings.type]);
    }
    return this.persist();
  }

  loadGeometry(): Promise<PlayRuntimeGeometry> {
    return Promise.resolve(this.app.queries.playfieldGeometry);
  }

  loadState(): Promise<PlayRuntimeState> {
    return Promise.resolve(this.app.queries.matchState as unknown as PlayRuntimeState);
  }

  async passTurn(): Promise<PlayRuntimeState> {
    this.app.commands.passTurn();
    return this.persist();
  }

  async placeTile(link: { cell: PlayRuntimeSlotId; tile: PlayRuntimeBlockId }): Promise<PlayRuntimeState> {
    this.app.commands.placeTile(link);
    this.app.commands.validateTurn();
    return this.persist();
  }

  async playOpponentTurn(): Promise<PlayRuntimeState> {
    this.app.commands.playOpponentTurn();
    return this.persist();
  }

  async resignMatch(): Promise<PlayRuntimeState> {
    this.app.commands.resignMatch();
    return this.persist();
  }

  async restartGame(): Promise<PlayRuntimeState> {
    this.app.commands.restartGame();
    return this.persist();
  }

  async saveTurn(): Promise<PlayRuntimeState> {
    this.app.commands.saveTurn();
    return this.persist();
  }

  async undoPlaceTile(tile: PlayRuntimeBlockId): Promise<PlayRuntimeState> {
    this.app.commands.undoPlaceTile(tile);
    this.app.commands.validateTurn();
    return this.persist();
  }

  private async persist(): Promise<PlayRuntimeState> {
    await DatabaseService.save(DatabaseName.PlayRuntimeEvents, eventsSchemaVersion, this.app.queries.eventLog);
    return this.loadState();
  }
}

class ServerHost {
  static async open(settings: null | PlayRuntimeSettings): Promise<ServerHost> {
    await FetchService.post('/api/match', settings ?? {});
    return new ServerHost();
  }

  async changeSettings(settings: Partial<PlayRuntimeSettings>): Promise<PlayRuntimeState> {
    return FetchService.patch<PlayRuntimeState>('/api/match/settings', settings);
  }

  async loadGeometry(): Promise<PlayRuntimeGeometry> {
    return FetchService.getJson<PlayRuntimeGeometry>('/api/playfield/geometry');
  }

  async loadState(): Promise<PlayRuntimeState> {
    return FetchService.getJson<PlayRuntimeState>('/api/match');
  }

  async passTurn(): Promise<PlayRuntimeState> {
    return FetchService.post<PlayRuntimeState>('/api/match/pass');
  }

  async placeTile(link: { cell: PlayRuntimeSlotId; tile: PlayRuntimeBlockId }): Promise<PlayRuntimeState> {
    await FetchService.put<PlayRuntimeState>('/api/playfield/tile', link);
    return FetchService.post<PlayRuntimeState>('/api/match/validation');
  }

  async playOpponentTurn(): Promise<PlayRuntimeState> {
    return FetchService.post<PlayRuntimeState>('/api/match/opponent-turn');
  }

  async resignMatch(): Promise<PlayRuntimeState> {
    return FetchService.post<PlayRuntimeState>('/api/match/resign');
  }

  async restartGame(): Promise<PlayRuntimeState> {
    return FetchService.post<PlayRuntimeState>('/api/game/restart');
  }

  async saveTurn(): Promise<PlayRuntimeState> {
    return FetchService.post<PlayRuntimeState>('/api/match/turn');
  }

  async undoPlaceTile(tile: PlayRuntimeBlockId): Promise<PlayRuntimeState> {
    await FetchService.delete<PlayRuntimeState>(`/api/playfield/tile/${encodeURIComponent(tile)}`);
    return FetchService.post<PlayRuntimeState>('/api/match/validation');
  }
}

export default class PlayRuntime {
  private static readonly LOADING_MIN_TIME_MS = 500;

  private static readonly OPPONENT_RESPONSE_MIN_TIME_MS = 2_000;

  get blocksPerPlayer(): number {
    return this.state.tilesPerPlayer;
  }

  get blocksRemaining(): number {
    return this.state.tilesRemaining;
  }

  get config(): PlayRuntimeConfig {
    return { hostType: this.hostType, settings: this.state.settings };
  }

  get configSettingsAreChangeable(): boolean {
    return this.state.settingsAreChangeable;
  }

  get currentTurnIsValid(): boolean {
    return this.state.currentTurnIsValid;
  }

  get currentTurnScore(): null | number {
    return this.state.currentTurnScore;
  }

  get events(): ReadonlyArray<PlayRuntimeEvent> {
    return this.state.events;
  }

  get isActionableForUser(): boolean {
    return this.state.currentPlayerIsUser;
  }

  get isFinished(): boolean {
    return this.state.isFinished;
  }

  get opponentScore(): number {
    return this.state.opponentScore;
  }

  get result(): PlayRuntimeResult {
    return this.state.result;
  }

  get selectedBlockId(): null | PlayRuntimeBlockId {
    return this.selectedToolbarBlockId;
  }

  get selectedBlockIsSlotted(): boolean {
    return this.selectedToolbarBlockId !== null && this.isBlockSlotted(this.selectedToolbarBlockId);
  }

  get settings(): PlayRuntimeSettings {
    return this.state.settings;
  }

  get slotIds(): ReadonlyArray<PlayRuntimeSlotId> {
    return this.state.cells.map(cell => cell.id);
  }

  get slotsPerAxis(): number {
    return this.state.cellsPerAxis;
  }

  get userBlocks(): ReadonlyArray<PlayRuntimeBlock> {
    return this.toolbarBlocks;
  }

  get userPassWillBeResign(): boolean {
    return this.state.userPassWillBeResign;
  }

  get userScore(): number {
    return this.state.userScore;
  }

  private geometry!: PlayRuntimeGeometry;

  private lastDrainedEventCount!: number;

  private selectedToolbarBlockId = $state<null | PlayRuntimeBlockId>(null);

  private state = $state<unknown>() as PlayRuntimeState;

  private toolbarBlocks = $state<Array<PlayRuntimeBlock>>([]);

  private get hostType(): PlayRuntimeHostType {
    switch (this.host.constructor) {
      case ClientHost:
        return PlayRuntimeHostType.Client;
      case ServerHost:
        return PlayRuntimeHostType.Server;
      default:
        throw new TypeError('expected host to be a ClientHost or a ServerHost');
    }
  }

  private constructor(private readonly host: ClientHost | ServerHost) {}

  static async create(config: PlayRuntimeConfig): Promise<PlayRuntime> {
    const startedAt = Date.now();
    let host: ClientHost | ServerHost;
    switch (config.hostType) {
      case PlayRuntimeHostType.Client:
        host = await ClientHost.open(config.settings);
        break;
      case PlayRuntimeHostType.Server:
        host = await ServerHost.open(config.settings);
        break;
    }
    const runtime = new PlayRuntime(host);
    await runtime.start();
    await new Promise(resolve => setTimeout(resolve, PlayRuntime.LOADING_MIN_TIME_MS - (Date.now() - startedAt)));
    return runtime;
  }

  private static mapEventSting(event: PlayRuntimeEvent): null | Sting {
    switch (event.type) {
      case PlayRuntimeEventType.MatchFinished:
        return event.winner === null
          ? Sting.Arch
          : event.winner === PlayRuntimePlayer.User
            ? Sting.RisingArpeggio
            : Sting.FallingArpeggio;
      case PlayRuntimeEventType.MatchStarted:
      case PlayRuntimeEventType.TurnValidationSet:
        return null;
      case PlayRuntimeEventType.TurnPassed:
        return event.player === PlayRuntimePlayer.User ? Sting.FallingThird : Sting.FallingFifth;
      case PlayRuntimeEventType.TurnSaved:
        return event.player === PlayRuntimePlayer.User ? Sting.RisingThird : Sting.RisingFifth;
    }
  }

  async changeSettings(settings: Partial<PlayRuntimeSettings>): Promise<void> {
    this.applyState(await this.host.changeSettings(settings));
  }

  deselectBlock(): void {
    this.selectedToolbarBlockId = null;
  }

  findBlockInSlot(slotId: PlayRuntimeSlotId): null | PlayRuntimeBlock {
    return this.state.cells[slotId]?.tile ?? null;
  }

  findSlotWithBlock(blockId: PlayRuntimeBlockId): PlayRuntimeSlotId | undefined {
    return this.state.cells.find(cell => cell.tile?.id === blockId)?.id;
  }

  getSlotAdjacents(slotId: PlayRuntimeSlotId): ReadonlyArray<PlayRuntimeSlotId> {
    const adjacents = this.geometry.adjacentsByCell[slotId];
    if (adjacents === undefined) throw new ReferenceError(`expected adjacent slots for slot ${String(slotId)}, got undefined`);
    return adjacents;
  }

  getSlotBonus(slotId: PlayRuntimeSlotId): null | PlayRuntimeSlotBonus {
    const cell = this.state.cells[slotId];
    if (cell === undefined) throw new ReferenceError(`expected slot ${String(slotId)}, got undefined`);
    return cell.bonus;
  }

  getSlotColumn(slotId: PlayRuntimeSlotId): number {
    const column = this.geometry.columnByCell[slotId];
    if (column === undefined) throw new ReferenceError(`expected column for slot ${String(slotId)}, got undefined`);
    return column;
  }

  getSlotRow(slotId: PlayRuntimeSlotId): number {
    const row = this.geometry.rowByCell[slotId];
    if (row === undefined) throw new ReferenceError(`expected row for slot ${String(slotId)}, got undefined`);
    return row;
  }

  isBlockInToolbar(blockId: PlayRuntimeBlockId): boolean {
    return this.findBlockIdx(blockId) !== -1;
  }

  isBlockSelected(blockId: PlayRuntimeBlockId): boolean {
    return this.selectedToolbarBlockId === blockId;
  }

  isBlockSlotted(blockId: PlayRuntimeBlockId): boolean {
    return this.findSlotWithBlock(blockId) !== undefined;
  }

  isSlotCenter(slotId: PlayRuntimeSlotId): boolean {
    return slotId === this.geometry.centerCell;
  }

  async pass(): Promise<void> {
    this.applyState(await this.host.passTurn());
    await this.settleOpponentTurn();
  }

  async resign(): Promise<void> {
    this.applyState(await this.host.resignMatch());
  }

  async restart(): Promise<void> {
    const state = await this.host.restartGame();
    if (await updated.check()) {
      location.reload();
      return;
    }
    this.applyState(state);
  }

  async save(): Promise<void> {
    this.applyState(await this.host.saveTurn());
    await this.settleOpponentTurn();
  }

  selectBlock(blockId: PlayRuntimeBlockId): void {
    if (this.findBlockIdx(blockId) === -1) return;
    this.selectedToolbarBlockId = blockId;
  }

  async slotBlock({ blockId, slotId }: { blockId: PlayRuntimeBlockId; slotId: PlayRuntimeSlotId }): Promise<void> {
    this.applyState(await this.host.placeTile({ cell: slotId, tile: blockId }));
  }

  swapBlocks(firstBlockId: PlayRuntimeBlockId, secondBlockId: PlayRuntimeBlockId): void {
    const firstIdx = this.findBlockIdx(firstBlockId);
    const secondIdx = this.findBlockIdx(secondBlockId);
    if (firstIdx < 0 || secondIdx < 0) {
      throw new Error(`cannot swap blocks: ${firstBlockId} or ${secondBlockId} is not in blocks`);
    }
    const first = this.toolbarBlocks[firstIdx];
    const second = this.toolbarBlocks[secondIdx];
    if (first === undefined || second === undefined) {
      throw new Error(`expected blocks at indices ${String(firstIdx)} and ${String(secondIdx)}, got undefined`);
    }
    this.toolbarBlocks[firstIdx] = second;
    this.toolbarBlocks[secondIdx] = first;
  }

  async undoSlotBlock(blockId: PlayRuntimeBlockId): Promise<void> {
    this.applyState(await this.host.undoPlaceTile(blockId));
  }

  private applyState(state: PlayRuntimeState): void {
    this.state = state;
    const { userTiles } = state;
    if (userTiles.length !== this.toolbarBlocks.length || userTiles.some(block => !this.isBlockInToolbar(block.id))) this.resetToolbar();
    this.playPendingStings();
  }

  private findBlockIdx(blockId: PlayRuntimeBlockId): number {
    return this.toolbarBlocks.findIndex(entry => entry.id === blockId);
  }

  private playPendingStings(): void {
    const { events } = this.state;
    if (this.lastDrainedEventCount > events.length) this.lastDrainedEventCount = 0;
    let lastSting: null | Sting = null;
    for (let idx = this.lastDrainedEventCount; idx < events.length; idx++) {
      const event = events[idx];
      if (event === undefined) continue;
      const sting = PlayRuntime.mapEventSting(event);
      if (sting !== null) lastSting = sting;
    }
    this.lastDrainedEventCount = events.length;
    if (lastSting !== null) AudioService.play(lastSting);
  }

  private resetToolbar(): void {
    this.toolbarBlocks = [...this.state.userTiles];
    this.selectedToolbarBlockId = null;
  }

  private async settleOpponentTurn(): Promise<void> {
    if (!this.state.opponentTurnIsDue) return;
    const startedAt = Date.now();
    const state = await this.host.playOpponentTurn();
    await new Promise(resolve => setTimeout(resolve, PlayRuntime.OPPONENT_RESPONSE_MIN_TIME_MS - (Date.now() - startedAt)));
    this.applyState(state);
  }

  private async start(): Promise<void> {
    const geometry = await this.host.loadGeometry();
    const state = await this.host.loadState();
    this.geometry = geometry;
    this.lastDrainedEventCount = state.events.length;
    this.state = state;
    this.resetToolbar();
  }
}
