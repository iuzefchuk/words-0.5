import { updated } from '$app/state';
import { PlayHostType } from '@/client/domain/enums/PlayHostType.ts';
import mapPlayEventSting from '@/client/domain/maps/mapPlayEventSting.ts';
import AudioService from '@/client/services/AudioService.ts';
import CryptoService from '@/client/services/CryptoService.ts';
import DatabaseService, { DatabaseName } from '@/client/services/DatabaseService.ts';
import FetchService from '@/client/services/FetchService.ts';
import App from '@/engine/app/App.ts';
import { DomainMatchDifficulty, DomainMatchType } from '@/engine/app/enums/index.ts';
import dictionaryUrl from '@/engine/assets/dictionary.bin?url';
import { eventsSchemaVersion } from '@/engine/domain/events/constants.ts';
import main from '@/engine/main.ts';
import type { PlayResult } from '@/client/domain/enums/PlayResult.ts';
import type { PlaySlotBonus } from '@/client/domain/enums/PlaySlotBonus.ts';
import type { PlayBlock } from '@/client/domain/types/PlayBlock.ts';
import type { PlayBlockId } from '@/client/domain/types/PlayBlockId.ts';
import type { PlayEvent } from '@/client/domain/types/PlayEvent.ts';
import type { PlayGeometry } from '@/client/domain/types/PlayGeometry.ts';
import type { PlaySettings } from '@/client/domain/types/PlaySettings.ts';
import type { PlaySlotId } from '@/client/domain/types/PlaySlotId.ts';
import type { PlayState } from '@/client/domain/types/PlayState.ts';
import type { Sting } from '@/client/services/AudioService.ts';
import type { DomainTimelineEvent } from '@/engine/app/types/index.ts';

class ClientHost {
  private constructor(private readonly app: App) {}

  static async open(): Promise<ClientHost> {
    const [dictionary, events] = await Promise.all([
      FetchService.getArrayBuffer(dictionaryUrl),
      DatabaseService.load(DatabaseName.PlayRuntimeEvents, eventsSchemaVersion),
    ]);
    const app = App.open(main(dictionary), events as null | ReadonlyArray<DomainTimelineEvent>, null, CryptoService.createSeed());
    if (app.queries.opponentTurnIsDue) app.commands.playOpponentTurn();
    const host = new ClientHost(app);
    await host.persist();
    return host;
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<PlayState> {
    if (settings.difficulty !== undefined) {
      this.app.commands.changeMatchDifficulty(DomainMatchDifficulty[settings.difficulty]);
    }
    if (settings.type !== undefined) {
      this.app.commands.changeMatchType(DomainMatchType[settings.type]);
    }
    return this.persist();
  }

  loadGeometry(): Promise<PlayGeometry> {
    return Promise.resolve(this.app.queries.playfieldGeometry);
  }

  loadState(): Promise<PlayState> {
    return Promise.resolve(this.app.queries.matchState as unknown as PlayState);
  }

  async passTurn(): Promise<PlayState> {
    this.app.commands.passTurn();
    return this.persist();
  }

  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    this.app.commands.placeTile(link);
    this.app.commands.validateTurn();
    return this.persist();
  }

  async playOpponentTurn(): Promise<PlayState> {
    this.app.commands.playOpponentTurn();
    return this.persist();
  }

  async resignMatch(): Promise<PlayState> {
    this.app.commands.resignMatch();
    return this.persist();
  }

  async restartGame(): Promise<PlayState> {
    this.app.commands.restartGame();
    return this.persist();
  }

  async saveTurn(): Promise<PlayState> {
    this.app.commands.saveTurn();
    return this.persist();
  }

  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    this.app.commands.undoPlaceTile(tile);
    this.app.commands.validateTurn();
    return this.persist();
  }

  private async persist(): Promise<PlayState> {
    await DatabaseService.save(DatabaseName.PlayRuntimeEvents, eventsSchemaVersion, this.app.queries.eventLog);
    return this.loadState();
  }
}

class ServerHost {
  static async open(): Promise<ServerHost> {
    await FetchService.post('/api/match');
    return new ServerHost();
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<PlayState> {
    return FetchService.patch<PlayState>('/api/match/settings', settings);
  }

  async loadGeometry(): Promise<PlayGeometry> {
    return FetchService.getJson<PlayGeometry>('/api/playfield/geometry');
  }

  async loadState(): Promise<PlayState> {
    return FetchService.getJson<PlayState>('/api/match');
  }

  async passTurn(): Promise<PlayState> {
    return FetchService.post<PlayState>('/api/match/pass');
  }

  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    await FetchService.put<PlayState>('/api/playfield/tile', link);
    return FetchService.post<PlayState>('/api/match/validation');
  }

  async playOpponentTurn(): Promise<PlayState> {
    return FetchService.post<PlayState>('/api/match/opponent-turn');
  }

  async resignMatch(): Promise<PlayState> {
    return FetchService.post<PlayState>('/api/match/resign');
  }

  async restartGame(): Promise<PlayState> {
    return FetchService.post<PlayState>('/api/game/restart');
  }

  async saveTurn(): Promise<PlayState> {
    return FetchService.post<PlayState>('/api/match/turn');
  }

  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    await FetchService.delete<PlayState>(`/api/playfield/tile/${encodeURIComponent(tile)}`);
    return FetchService.post<PlayState>('/api/match/validation');
  }
}

export default class PlayRuntime {
  private static readonly OPPONENT_RESPONSE_ARTIFICIAL_DELAY_MS = 2_000;

  get blocksPerPlayer(): number {
    return this.state.tilesPerPlayer;
  }

  get blocksRemaining(): number {
    return this.state.tilesRemaining;
  }

  get currentTurnIsValid(): boolean {
    return this.state.currentTurnIsValid;
  }

  get currentTurnScore(): null | number {
    return this.state.currentTurnScore;
  }

  get events(): ReadonlyArray<PlayEvent> {
    return this.state.events;
  }

  get hostType(): PlayHostType {
    switch (this.host.constructor) {
      case ClientHost:
        return PlayHostType.Client;
      case ServerHost:
        return PlayHostType.Server;
      default:
        throw new TypeError('expected host to be a ClientHost or a ServerHost');
    }
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

  get result(): PlayResult {
    return this.state.result;
  }

  get selectedBlockId(): null | PlayBlockId {
    return this.selectedToolbarBlockId;
  }

  get selectedBlockIsSlotted(): boolean {
    return this.selectedToolbarBlockId !== null && this.isBlockSlotted(this.selectedToolbarBlockId);
  }

  get settings(): PlaySettings {
    return this.state.settings;
  }

  get settingsAreChangeable(): boolean {
    return this.state.settingsAreChangeable;
  }

  get slotIds(): ReadonlyArray<PlaySlotId> {
    return this.state.cells.map(cell => cell.id);
  }

  get slotsPerAxis(): number {
    return this.state.cellsPerAxis;
  }

  get userBlocks(): ReadonlyArray<PlayBlock> {
    return this.toolbarBlocks;
  }

  get userPassWillBeResign(): boolean {
    return this.state.userPassWillBeResign;
  }

  get userScore(): number {
    return this.state.userScore;
  }

  private geometry!: PlayGeometry;

  private lastDrainedEventCount!: number;

  private selectedToolbarBlockId = $state<null | PlayBlockId>(null);

  private state = $state<unknown>() as PlayState;

  private toolbarBlocks = $state<Array<PlayBlock>>([]);

  private constructor(private readonly host: ClientHost | ServerHost) {}

  static async create(hostType: PlayHostType): Promise<PlayRuntime> {
    let host: ClientHost | ServerHost;
    switch (hostType) {
      case PlayHostType.Client:
        host = await ClientHost.open();
        break;
      case PlayHostType.Server:
        host = await ServerHost.open();
        break;
    }
    const runtime = new PlayRuntime(host);
    await runtime.start();
    return runtime;
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<void> {
    this.applyState(await this.host.changeSettings(settings));
  }

  deselectBlock(): void {
    this.selectedToolbarBlockId = null;
  }

  findBlockInSlot(slotId: PlaySlotId): null | PlayBlock {
    return this.state.cells[slotId]?.tile ?? null;
  }

  findSlotWithBlock(blockId: PlayBlockId): PlaySlotId | undefined {
    return this.state.cells.find(cell => cell.tile?.id === blockId)?.id;
  }

  getSlotAdjacents(slotId: PlaySlotId): ReadonlyArray<PlaySlotId> {
    const adjacents = this.geometry.adjacentsByCell[slotId];
    if (adjacents === undefined) throw new ReferenceError(`expected adjacent slots for slot ${String(slotId)}, got undefined`);
    return adjacents;
  }

  getSlotBonus(slotId: PlaySlotId): null | PlaySlotBonus {
    const cell = this.state.cells[slotId];
    if (cell === undefined) throw new ReferenceError(`expected slot ${String(slotId)}, got undefined`);
    return cell.bonus;
  }

  getSlotColumn(slotId: PlaySlotId): number {
    const column = this.geometry.columnByCell[slotId];
    if (column === undefined) throw new ReferenceError(`expected column for slot ${String(slotId)}, got undefined`);
    return column;
  }

  getSlotRow(slotId: PlaySlotId): number {
    const row = this.geometry.rowByCell[slotId];
    if (row === undefined) throw new ReferenceError(`expected row for slot ${String(slotId)}, got undefined`);
    return row;
  }

  isBlockInToolbar(blockId: PlayBlockId): boolean {
    return this.findBlockIdx(blockId) !== -1;
  }

  isBlockSelected(blockId: PlayBlockId): boolean {
    return this.selectedToolbarBlockId === blockId;
  }

  isBlockSlotted(blockId: PlayBlockId): boolean {
    return this.findSlotWithBlock(blockId) !== undefined;
  }

  isSlotCenter(slotId: PlaySlotId): boolean {
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

  selectBlock(blockId: PlayBlockId): void {
    if (this.findBlockIdx(blockId) === -1) return;
    this.selectedToolbarBlockId = blockId;
  }

  async slotBlock({ blockId, slotId }: { blockId: PlayBlockId; slotId: PlaySlotId }): Promise<void> {
    this.applyState(await this.host.placeTile({ cell: slotId, tile: blockId }));
  }

  swapBlocks(firstBlockId: PlayBlockId, secondBlockId: PlayBlockId): void {
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

  async undoSlotBlock(blockId: PlayBlockId): Promise<void> {
    this.applyState(await this.host.undoPlaceTile(blockId));
  }

  private applyState(state: PlayState): void {
    this.state = state;
    const { userTiles } = state;
    if (userTiles.length !== this.toolbarBlocks.length || userTiles.some(block => !this.isBlockInToolbar(block.id)))
      this.resetToolbar();
    this.playPendingStings();
  }

  private findBlockIdx(blockId: PlayBlockId): number {
    return this.toolbarBlocks.findIndex(entry => entry.id === blockId);
  }

  private playPendingStings(): void {
    const { events } = this.state;
    if (this.lastDrainedEventCount > events.length) this.lastDrainedEventCount = 0;
    let lastSting: null | Sting = null;
    for (let idx = this.lastDrainedEventCount; idx < events.length; idx++) {
      const event = events[idx];
      if (event === undefined) continue;
      const sting = mapPlayEventSting(event);
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
    await new Promise(resolve =>
      setTimeout(resolve, PlayRuntime.OPPONENT_RESPONSE_ARTIFICIAL_DELAY_MS - (Date.now() - startedAt)),
    );
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
