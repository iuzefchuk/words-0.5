import { updated } from '$app/state';
import { PlayEngineType, PlayEventType, PlayPlayer } from '@/client/src/domain/play.ts';
import AudioSynthAdapter from '@/client/src/platform/by-port/io/audio/adapters/synth.ts';
import { AudioSting } from '@/client/src/platform/by-port/io/audio/port.ts';
import api from '@/client/src/platform/by-protocol/usecases/http/api.ts';
import engineWasm from '@/client/src/platform/by-protocol/usecases/wasm/engine.wasm.ts';
import type {
  PlayBlock,
  PlayBlockId,
  PlayEngine,
  PlayEvent,
  PlayGeometry,
  PlayResult,
  PlaySettings,
  PlaySlotBonus,
  PlaySlotId,
  PlayState,
} from '@/client/src/domain/play.ts';

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

  get engineType(): PlayEngineType {
    switch (this.engine) {
      case api:
        return PlayEngineType.Server;
      case engineWasm:
        return PlayEngineType.Client;
      default:
        throw new TypeError('expected engine to be api or engineWasm');
    }
  }

  get events(): ReadonlyArray<PlayEvent> {
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

  private lastDrainedEventCount: number;

  private selectedToolbarBlockId = $state<null | PlayBlockId>(null);

  private state: PlayState;

  private toolbarBlocks: Array<PlayBlock>;

  private constructor(
    private readonly engine: PlayEngine,
    private readonly geometry: PlayGeometry,
    state: PlayState,
  ) {
    this.lastDrainedEventCount = state.events.length;
    this.state = $state(state);
    this.toolbarBlocks = $state([...state.userTiles]);
  }

  static async create(engineType: PlayEngineType): Promise<PlayRuntime> {
    let engine: PlayEngine;
    switch (engineType) {
      case PlayEngineType.Client:
        engine = engineWasm;
        break;
      case PlayEngineType.Server:
        engine = api;
        break;
    }
    await engine.open();
    const geometry = await engine.loadGeometry();
    const state = await engine.loadState();
    return new PlayRuntime(engine, geometry, state);
  }

  async changeSettings(settings: Partial<PlaySettings>): Promise<void> {
    this.applyState(await this.engine.changeSettings(settings));
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
    this.applyState(await this.engine.passTurn());
    await this.settleOpponentTurn();
  }

  async resign(): Promise<void> {
    this.applyState(await this.engine.resignMatch());
  }

  async restart(): Promise<void> {
    const state = await this.engine.restartGame();
    if (await updated.check()) {
      location.reload();
      return;
    }
    this.applyState(state);
  }

  async save(): Promise<void> {
    this.applyState(await this.engine.saveTurn());
    await this.settleOpponentTurn();
  }

  selectBlock(blockId: PlayBlockId): void {
    if (this.findBlockIdx(blockId) === -1) return;
    this.selectedToolbarBlockId = blockId;
  }

  async slotBlock({ blockId, slotId }: { blockId: PlayBlockId; slotId: PlaySlotId }): Promise<void> {
    this.applyState(await this.engine.placeTile({ cell: slotId, tile: blockId }));
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
    this.applyState(await this.engine.undoPlaceTile(blockId));
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
    let lastSting: AudioSting | null = null;
    for (let idx = this.lastDrainedEventCount; idx < events.length; idx++) {
      const event = events[idx];
      if (event === undefined) continue;
      const sting = mapPlayEventAudioSting(event);
      if (sting !== null) lastSting = sting;
    }
    this.lastDrainedEventCount = events.length;
    if (lastSting !== null) AudioSynthAdapter.play(lastSting);
  }

  private resetToolbar(): void {
    this.toolbarBlocks = [...this.state.userTiles];
    this.selectedToolbarBlockId = null;
  }

  private async settleOpponentTurn(): Promise<void> {
    if (!this.state.opponentTurnIsDue) return;
    const startedAt = Date.now();
    const state = await this.engine.playOpponentTurn();
    await new Promise(resolve =>
      setTimeout(resolve, PlayRuntime.OPPONENT_RESPONSE_ARTIFICIAL_DELAY_MS - (Date.now() - startedAt)),
    );
    this.applyState(state);
  }
}

function mapPlayEventAudioSting(event: PlayEvent): AudioSting | null {
  switch (event.type) {
    case PlayEventType.MatchFinished:
      return event.winner === null
        ? AudioSting.Arch
        : event.winner === PlayPlayer.User
          ? AudioSting.RisingArpeggio
          : AudioSting.FallingArpeggio;
    case PlayEventType.MatchStarted:
    case PlayEventType.TurnValidationSet:
      return null;
    case PlayEventType.TurnPassed:
      return event.player === PlayPlayer.User ? AudioSting.FallingThird : AudioSting.FallingFifth;
    case PlayEventType.TurnSaved:
      return event.player === PlayPlayer.User ? AudioSting.RisingThird : AudioSting.RisingFifth;
  }
}
