import { updated } from '$app/state';
import { PlayHostType } from '@/client/src/domain/play.ts';
import AbiWasmAdapter from '@/client/src/platform/infra/abi/adapters/wasm.ts';
import MediaAudioAdapter from '@/client/src/platform/infra/media/adapters/audio.ts';
import NetworkHttpAdapter from '@/client/src/platform/infra/network/adapters/http.ts';
import StorageDbAdapter, { DbName } from '@/client/src/platform/infra/storage/adapters/db.ts';
import mapPlayEventSting from '@/client/src/platform/usecases/maps/mapPlayEventSting.ts';
import dictionaryUrl from '@/engine/src/assets/dictionary.bin?url';
import engineUrl from '@/engine/target/wasm32-unknown-unknown/release/engine.wasm?url';
import type {
  PlayBlock,
  PlayBlockId,
  PlayEvent,
  PlayGeometry,
  PlayResult,
  PlaySettings,
  PlaySlotBonus,
  PlaySlotId,
  PlayState,
} from '@/client/src/domain/play.ts';
import type { Sting } from '@/client/src/platform/infra/media/port.ts';

type EngineExports = {
  app_change_match_difficulty(handle: number, pointer: number): number;
  app_change_match_type(handle: number, pointer: number): number;
  app_event_log(handle: number): number;
  app_match_state(handle: number): number;
  app_open(eventsPointer: number, settingsPointer: number, seed: number): number;
  app_opponent_turn_is_due(handle: number): number;
  app_pass_turn(handle: number): number;
  app_place_tile(handle: number, cell: number, pointer: number): number;
  app_play_opponent_turn(handle: number): number;
  app_playfield_geometry(handle: number): number;
  app_resign_match(handle: number): number;
  app_restart_game(handle: number): number;
  app_save_turn(handle: number): number;
  app_undo_place_tile(handle: number, pointer: number): number;
  app_validate_turn(handle: number): number;
  engine_open(pointer: number): number;
  events_schema_version(): number;
};

class ClientHost {
  private constructor(
    private readonly exports: EngineExports,
    private readonly handle: number,
    private readonly version: number,
  ) {}

  static async open(): Promise<ClientHost> {
    const [dictionary, wasm] = await Promise.all([
      NetworkHttpAdapter.getArrayBuffer(dictionaryUrl),
      NetworkHttpAdapter.getArrayBuffer(engineUrl),
    ]);
    const exports = await AbiWasmAdapter.instantiate<EngineExports>(wasm);
    AbiWasmAdapter.callText(() => exports.engine_open(AbiWasmAdapter.allocate(new Uint8Array(dictionary))));
    const version = AbiWasmAdapter.callNumber(() => exports.events_schema_version());
    const snapshot = (await StorageDbAdapter.load(DbName.PlayRuntimeEvents)) as { events: unknown; version: number } | null;
    const events = snapshot?.version === version ? snapshot.events : null;
    const [seed] = crypto.getRandomValues(new Uint32Array(1));
    if (seed === undefined) throw new ReferenceError('expected random seed, got undefined');
    const handle = Number(
      AbiWasmAdapter.callText(() =>
        exports.app_open(AbiWasmAdapter.allocate(events === null ? '' : JSON.stringify(events)), 0, seed),
      ),
    );
    const host = new ClientHost(exports, handle, version);
    if (host.opponentTurnIsDue()) AbiWasmAdapter.callText(() => exports.app_play_opponent_turn(handle));
    await host.persist();
    return host;
  }

  async changeSettings({ difficulty, type }: Partial<PlaySettings>): Promise<PlayState> {
    if (difficulty !== undefined) {
      AbiWasmAdapter.callText(() => this.exports.app_change_match_difficulty(this.handle, AbiWasmAdapter.allocate(difficulty)));
    }
    if (type !== undefined) {
      AbiWasmAdapter.callText(() => this.exports.app_change_match_type(this.handle, AbiWasmAdapter.allocate(type)));
    }
    return this.persist();
  }

  loadGeometry(): Promise<PlayGeometry> {
    return Promise.resolve(AbiWasmAdapter.callJson(() => this.exports.app_playfield_geometry(this.handle)) as PlayGeometry);
  }

  loadState(): Promise<PlayState> {
    return Promise.resolve(AbiWasmAdapter.callJson(() => this.exports.app_match_state(this.handle)) as PlayState);
  }

  async passTurn(): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_pass_turn(this.handle));
    return this.persist();
  }

  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_place_tile(this.handle, link.cell, AbiWasmAdapter.allocate(link.tile)));
    AbiWasmAdapter.callText(() => this.exports.app_validate_turn(this.handle));
    return this.persist();
  }

  async playOpponentTurn(): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_play_opponent_turn(this.handle));
    return this.persist();
  }

  async resignMatch(): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_resign_match(this.handle));
    return this.persist();
  }

  async restartGame(): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_restart_game(this.handle));
    return this.persist();
  }

  async saveTurn(): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_save_turn(this.handle));
    return this.persist();
  }

  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    AbiWasmAdapter.callText(() => this.exports.app_undo_place_tile(this.handle, AbiWasmAdapter.allocate(tile)));
    AbiWasmAdapter.callText(() => this.exports.app_validate_turn(this.handle));
    return this.persist();
  }

  private opponentTurnIsDue(): boolean {
    return AbiWasmAdapter.callJson(() => this.exports.app_opponent_turn_is_due(this.handle)) === true;
  }

  private async persist(): Promise<PlayState> {
    const log = AbiWasmAdapter.callJson(() => this.exports.app_event_log(this.handle));
    await StorageDbAdapter.save(DbName.PlayRuntimeEvents, { events: log, version: this.version });
    return this.loadState();
  }
}

class ServerHost {
  static async open(): Promise<ServerHost> {
    await NetworkHttpAdapter.post('/api/match');
    return new ServerHost();
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<PlayState> {
    return NetworkHttpAdapter.patch<PlayState>('/api/match/settings', settings);
  }

  async loadGeometry(): Promise<PlayGeometry> {
    return NetworkHttpAdapter.getJson<PlayGeometry>('/api/playfield/geometry');
  }

  async loadState(): Promise<PlayState> {
    return NetworkHttpAdapter.getJson<PlayState>('/api/match');
  }

  async passTurn(): Promise<PlayState> {
    return NetworkHttpAdapter.post<PlayState>('/api/match/pass');
  }

  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    await NetworkHttpAdapter.put<PlayState>('/api/playfield/tile', link);
    return NetworkHttpAdapter.post<PlayState>('/api/match/validation');
  }

  async playOpponentTurn(): Promise<PlayState> {
    return NetworkHttpAdapter.post<PlayState>('/api/match/opponent-turn');
  }

  async resignMatch(): Promise<PlayState> {
    return NetworkHttpAdapter.post<PlayState>('/api/match/resign');
  }

  async restartGame(): Promise<PlayState> {
    return NetworkHttpAdapter.post<PlayState>('/api/game/restart');
  }

  async saveTurn(): Promise<PlayState> {
    return NetworkHttpAdapter.post<PlayState>('/api/match/turn');
  }

  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    await NetworkHttpAdapter.delete<PlayState>(`/api/playfield/tile/${encodeURIComponent(tile)}`);
    return NetworkHttpAdapter.post<PlayState>('/api/match/validation');
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
    if (lastSting !== null) MediaAudioAdapter.play(lastSting);
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
