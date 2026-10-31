import { updated } from '$app/state';
import { PlayHostType } from '@/client/domain/enums/PlayHostType.ts';
import mapPlayEventSting from '@/client/domain/maps/mapPlayEventSting.ts';
import AudioService from '@/client/services/AudioService.ts';
import CryptoService from '@/client/services/CryptoService.ts';
import DatabaseService, { DatabaseName } from '@/client/services/DatabaseService.ts';
import FetchService from '@/client/services/FetchService.ts';
import dictionaryUrl from '@/engine/src/assets/dictionary.bin?url';
import engineUrl from '@/engine/target/wasm32-unknown-unknown/release/engine.wasm?url';
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

type EngineCall = (exports: EngineExports) => number;

type EngineCallWithInput = (exports: EngineExports, pointer: number, length: number) => number;

type EngineExports = {
  alloc(length: number): number;
  app_change_match_difficulty(handle: number, pointer: number, length: number): number;
  app_change_match_type(handle: number, pointer: number, length: number): number;
  app_clear_user_tiles(handle: number): number;
  app_close(handle: number): number;
  app_event_log(handle: number): number;
  app_match_state(handle: number): number;
  app_open(eventsPointer: number, eventsLength: number, settingsPointer: number, settingsLength: number, seed: number): number;
  app_opponent_turn_is_due(handle: number): number;
  app_pass_turn(handle: number): number;
  app_place_tile(handle: number, cell: number, pointer: number, length: number): number;
  app_play_opponent_turn(handle: number): number;
  app_playfield_geometry(handle: number): number;
  app_resign_match(handle: number): number;
  app_restart_game(handle: number): number;
  app_save_turn(handle: number): number;
  app_shuffle_user_tiles(handle: number): number;
  app_undo_place_tile(handle: number, pointer: number, length: number): number;
  app_validate_turn(handle: number): number;
  dealloc(pointer: number, length: number): void;
  engine_open(pointer: number, length: number): number;
  events_schema_version(): number;
  memory: WebAssembly.Memory;
  panic_message(): number;
};

class ClientHost {
  private constructor(
    private readonly engine: EngineInstance,
    private readonly handle: number,
  ) {}

  static async open(): Promise<ClientHost> {
    const [dictionary, wasm] = await Promise.all([
      FetchService.getArrayBuffer(dictionaryUrl),
      FetchService.getArrayBuffer(engineUrl),
    ]);
    const engine = await EngineInstance.instantiate(wasm);
    engine.callWithBytes(new Uint8Array(dictionary), (exports, pointer, length) => exports.engine_open(pointer, length));
    const events = await DatabaseService.load(DatabaseName.PlayRuntimeEvents, engine.version);
    const seed = CryptoService.createSeed();
    const handle = Number(
      engine.callWithText(events === null ? '' : JSON.stringify(events), (exports, pointer, length) =>
        exports.app_open(pointer, length, 0, 0, seed),
      ),
    );
    const host = new ClientHost(engine, handle);
    if (host.opponentTurnIsDue()) host.engine.call(exports => exports.app_play_opponent_turn(handle));
    await host.persist();
    return host;
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<PlayState> {
    if (settings.difficulty !== undefined) {
      this.engine.callWithText(settings.difficulty, (exports, pointer, length) =>
        exports.app_change_match_difficulty(this.handle, pointer, length),
      );
    }
    if (settings.type !== undefined) {
      this.engine.callWithText(settings.type, (exports, pointer, length) =>
        exports.app_change_match_type(this.handle, pointer, length),
      );
    }
    return this.persist();
  }

  loadGeometry(): Promise<PlayGeometry> {
    return Promise.resolve(this.engine.json(exports => exports.app_playfield_geometry(this.handle)) as PlayGeometry);
  }

  loadState(): Promise<PlayState> {
    return Promise.resolve(this.engine.json(exports => exports.app_match_state(this.handle)) as PlayState);
  }

  async passTurn(): Promise<PlayState> {
    this.engine.call(exports => exports.app_pass_turn(this.handle));
    return this.persist();
  }

  async placeTile(link: { cell: PlaySlotId; tile: PlayBlockId }): Promise<PlayState> {
    this.engine.callWithText(link.tile, (exports, pointer, length) =>
      exports.app_place_tile(this.handle, link.cell, pointer, length),
    );
    this.engine.call(exports => exports.app_validate_turn(this.handle));
    return this.persist();
  }

  async playOpponentTurn(): Promise<PlayState> {
    this.engine.call(exports => exports.app_play_opponent_turn(this.handle));
    return this.persist();
  }

  async resignMatch(): Promise<PlayState> {
    this.engine.call(exports => exports.app_resign_match(this.handle));
    return this.persist();
  }

  async restartGame(): Promise<PlayState> {
    this.engine.call(exports => exports.app_restart_game(this.handle));
    return this.persist();
  }

  async saveTurn(): Promise<PlayState> {
    this.engine.call(exports => exports.app_save_turn(this.handle));
    return this.persist();
  }

  async undoPlaceTile(tile: PlayBlockId): Promise<PlayState> {
    this.engine.callWithText(tile, (exports, pointer, length) => exports.app_undo_place_tile(this.handle, pointer, length));
    this.engine.call(exports => exports.app_validate_turn(this.handle));
    return this.persist();
  }

  private opponentTurnIsDue(): boolean {
    return this.engine.json(exports => exports.app_opponent_turn_is_due(this.handle)) === true;
  }

  private async persist(): Promise<PlayState> {
    const log = this.engine.json(exports => exports.app_event_log(this.handle));
    await DatabaseService.save(DatabaseName.PlayRuntimeEvents, this.engine.version, log);
    return this.loadState();
  }
}

class EngineInstance {
  private static readonly DECODER = new TextDecoder();

  private static readonly ENCODER = new TextEncoder();

  private static readonly HEADER_LENGTH = 5;

  private static readonly STATUS_OK = 0;

  get version(): number {
    return this.exports.events_schema_version();
  }

  private constructor(private readonly exports: EngineExports) {}

  static async instantiate(wasm: ArrayBuffer): Promise<EngineInstance> {
    const { instance } = await WebAssembly.instantiate(wasm, {});
    return new EngineInstance(instance.exports as EngineExports);
  }

  call(invoke: EngineCall): string {
    let pointer: number;
    try {
      pointer = invoke(this.exports);
    } catch (error) {
      throw new Error(this.readPanicMessage(), { cause: error });
    }
    return this.read(pointer);
  }

  callWithBytes(bytes: Uint8Array, invoke: EngineCallWithInput): string {
    if (bytes.length === 0) return this.call(exports => invoke(exports, 0, 0));
    const pointer = this.exports.alloc(bytes.length);
    this.memory().set(bytes, pointer);
    try {
      return this.call(exports => invoke(exports, pointer, bytes.length));
    } finally {
      this.exports.dealloc(pointer, bytes.length);
    }
  }

  callWithText(text: string, invoke: EngineCallWithInput): string {
    return this.callWithBytes(EngineInstance.ENCODER.encode(text), invoke);
  }

  json(invoke: EngineCall): unknown {
    return JSON.parse(this.call(invoke));
  }

  private memory(): Uint8Array {
    return new Uint8Array(this.exports.memory.buffer);
  }

  private read(pointer: number): string {
    const view = this.memory();
    const status = view[pointer];
    const length =
      ((view[pointer + 1] ?? 0) |
        ((view[pointer + 2] ?? 0) << 8) |
        ((view[pointer + 3] ?? 0) << 16) |
        ((view[pointer + 4] ?? 0) << 24)) >>>
      0;
    const start = pointer + EngineInstance.HEADER_LENGTH;
    const text = EngineInstance.DECODER.decode(view.subarray(start, start + length));
    this.exports.dealloc(pointer, EngineInstance.HEADER_LENGTH + length);
    if (status !== EngineInstance.STATUS_OK) throw new Error(text);
    return text;
  }

  private readPanicMessage(): string {
    try {
      return this.read(this.exports.panic_message());
    } catch {
      return 'engine panicked';
    }
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
