import createAppRuntime from '@/index.ts';
import { getEventSound } from '@/interface/mappings.ts';
import SoundPlayer from '@/interface/services/SoundPlayer.ts';
import type App from '@/app/App.ts';
import type { DomainInventoryLetter, DomainPlayfieldBonus } from '@/app/enums/index.ts';
import type { DomainInventoryTile, DomainPlayfieldCell } from '@/app/types/index.ts';
import type { Sound } from '@/interface/services/SoundPlayer.ts';

type Queries = App['queries'];

// Wraps the framework-agnostic App with version-counter reactivity: reads touch a counter so they
// re-run when a write bumps it. Two counters keep playfield-only changes from re-deriving everything.
class Main {
  private app = $state<App | null>(null);

  bootError = $state<null | string>(null);

  bootProgress = $state(0);

  private stateVersion = $state(0);

  private playfieldVersion = $state(0);

  private lastDrainedEventCount = 0;

  private pendingValidationId = 0;

  get allActionsAreDisabled(): boolean {
    return !this.readState(queries => queries.currentPlayerIsUser);
  }

  get appReady(): boolean {
    return this.app !== null;
  }

  get currentPlayerIsUser(): boolean {
    return this.readState(queries => queries.currentPlayerIsUser);
  }

  get currentTurnIsValid(): boolean {
    return this.readPlayfield(queries => queries.currentTurnIsValid);
  }

  get currentTurnScore(): number | undefined {
    return this.readPlayfield(queries => queries.currentTurnScore);
  }

  get events(): Queries['eventsView'] {
    return this.readState(queries => queries.eventsView);
  }

  get hasPriorTurns(): boolean {
    return this.readState(queries => queries.turnHistoryHasPriorTurns);
  }

  get matchDifficulty(): Queries['matchDifficulty'] {
    return this.readState(queries => queries.matchDifficulty);
  }

  get matchIsFinished(): boolean {
    return this.readState(queries => queries.matchIsFinished);
  }

  get matchResult(): Queries['matchResult'] {
    return this.readState(queries => queries.matchResult);
  }

  get matchType(): Queries['matchType'] {
    return this.readPlayfield(queries => queries.matchType);
  }

  get opponentScore(): number {
    return this.readState(queries => queries.opponentScore);
  }

  get playfieldCells(): ReadonlyArray<DomainPlayfieldCell> {
    return this.readState(queries => queries.playfieldCells);
  }

  get playfieldCellsPerAxis(): number {
    return this.readState(queries => queries.playfieldCellsPerAxis);
  }

  get settingsChangeIsAllowed(): boolean {
    return this.readState(queries => queries.settingsChangeIsAllowed);
  }

  get tilesPerPlayer(): number {
    return this.readState(queries => queries.tilesPerPlayer);
  }

  get tilesRemaining(): number {
    return this.readState(queries => queries.tilesRemaining);
  }

  get userPassWillBeResign(): boolean {
    return this.readState(queries => queries.userPassWillBeResign);
  }

  get userScore(): number {
    return this.readState(queries => queries.userScore);
  }

  get userTiles(): ReadonlyArray<DomainInventoryTile> {
    return this.readState(queries => queries.userTiles);
  }

  areTilesSame(firstTile: DomainInventoryTile, secondTile: DomainInventoryTile): boolean {
    return this.requireApp().queries.areTilesSame(firstTile, secondTile);
  }

  changeMatchDifficulty(matchDifficulty: Parameters<App['commands']['changeMatchDifficulty']>[0]): void {
    this.writeState(() => {
      this.requireApp().commands.changeMatchDifficulty(matchDifficulty);
    });
  }

  changeMatchType(matchType: Parameters<App['commands']['changeMatchType']>[0]): void {
    this.writeState(() => {
      this.requireApp().commands.changeMatchType(matchType);
    });
  }

  clearUserTiles(): void {
    this.writePlayfield(() => {
      this.requireApp().commands.clearUserTiles();
    });
  }

  findCellWithTile(tile: DomainInventoryTile): DomainPlayfieldCell | undefined {
    return this.readPlayfield(queries => queries.findCellWithTile(tile));
  }

  findTileOnCell(cell: DomainPlayfieldCell): DomainInventoryTile | undefined {
    return this.readPlayfield(queries => queries.findTileOnCell(cell));
  }

  getAdjacentCells(cell: DomainPlayfieldCell): ReadonlyArray<DomainPlayfieldCell> {
    return this.requireApp().queries.getAdjacentCells(cell);
  }

  getCellBonus(cell: DomainPlayfieldCell): DomainPlayfieldBonus | null {
    return this.readState(queries => queries.getCellBonus(cell));
  }

  getCellColumnIndex(cell: DomainPlayfieldCell): number {
    return this.requireApp().queries.getCellColumnIndex(cell);
  }

  getCellRowIndex(cell: DomainPlayfieldCell): number {
    return this.requireApp().queries.getCellRowIndex(cell);
  }

  getLetterPoints(letter: DomainInventoryLetter): number {
    return this.requireApp().queries.getLetterPoints(letter);
  }

  getTileLetter(tile: DomainInventoryTile): DomainInventoryLetter {
    return this.requireApp().queries.getTileLetter(tile);
  }

  async initiate(): Promise<void> {
    const { bootProgressPublisher, promise } = createAppRuntime();
    bootProgressPublisher.subscribe(progress => {
      this.bootProgress = progress;
    });
    try {
      this.app = await promise;
    } catch (error: unknown) {
      this.bootError = error instanceof Error ? error.message : String(error);
    }
  }

  isCellCenter(cell: DomainPlayfieldCell): boolean {
    return this.requireApp().queries.isCellCenter(cell);
  }

  isTilePlaced(tile: DomainInventoryTile): boolean {
    return this.readPlayfield(queries => queries.isTilePlaced(tile));
  }

  pass(): void {
    const { opponentTurn } = this.writeAndPlaySound(() => this.requireApp().commands.passTurn());
    void opponentTurn?.then(() => {
      this.syncAndPlaySound();
    });
  }

  placeTile(args: { cell: DomainPlayfieldCell; tile: DomainInventoryTile }): void {
    this.writePlayfieldAndPlaySound(() => {
      this.requireApp().commands.placeTile(args);
    });
    this.scheduleDeferredValidation();
  }

  resign(): void {
    this.writeAndPlaySound(() => {
      this.requireApp().commands.resignMatch();
    });
  }

  restartGame(): void {
    this.writeState(() => {
      this.requireApp().commands.restartGame();
    });
  }

  save(): void {
    const { opponentTurn } = this.writeAndPlaySound(() => this.requireApp().commands.saveTurn());
    void opponentTurn?.then(() => {
      this.syncAndPlaySound();
    });
  }

  shuffleUserTiles(): void {
    this.requireApp().commands.shuffleUserTiles();
  }

  undoPlaceTile(tile: DomainInventoryTile): void {
    this.writePlayfieldAndPlaySound(() => {
      this.requireApp().commands.undoPlaceTile(tile);
    });
    this.scheduleDeferredValidation();
  }

  wasTileUsedInPreviousTurn(tile: DomainInventoryTile): boolean {
    return this.readPlayfield(queries => queries.wasTileUsedInPreviousTurn(tile));
  }

  private incrementVersions(): void {
    this.playfieldVersion++;
    this.stateVersion++;
  }

  private playPendingSounds(): void {
    const events = this.requireApp().queries.eventsView;
    if (this.lastDrainedEventCount > events.length) this.lastDrainedEventCount = 0;
    let lastSound: null | Sound = null;
    for (let idx = this.lastDrainedEventCount; idx < events.length; idx++) {
      const event = events[idx];
      if (event === undefined) continue;
      const sound = getEventSound(event);
      if (sound !== null) lastSound = sound;
    }
    this.lastDrainedEventCount = events.length;
    if (lastSound !== null) SoundPlayer.execute(lastSound);
  }

  private readPlayfield<T>(fn: (queries: Queries) => T): T {
    void this.playfieldVersion;
    return fn(this.requireApp().queries);
  }

  private readState<T>(fn: (queries: Queries) => T): T {
    void this.stateVersion;
    return fn(this.requireApp().queries);
  }

  private requireApp(): App {
    if (this.app === null) throw new Error('Main: app is not ready');
    return this.app;
  }

  private scheduleDeferredValidation(): void {
    const validationId = ++this.pendingValidationId;
    void this.requireApp()
      .yield()
      .then(() => {
        if (validationId !== this.pendingValidationId) return;
        this.writePlayfieldAndPlaySound(() => {
          this.requireApp().commands.validateTurn();
        });
      });
  }

  private syncAndPlaySound(): void {
    this.incrementVersions();
    this.playPendingSounds();
  }

  private writeAndPlaySound<R>(fn: () => R): R {
    const response = this.writeState(fn);
    this.playPendingSounds();
    return response;
  }

  private writePlayfield<R>(fn: () => R): R {
    const result = fn();
    this.playfieldVersion++;
    return result;
  }

  private writePlayfieldAndPlaySound<R>(fn: () => R): R {
    const response = this.writePlayfield(fn);
    this.playPendingSounds();
    return response;
  }

  private writeState<R>(fn: () => R): R {
    const result = fn();
    this.incrementVersions();
    if (result instanceof Promise) {
      void result.then(
        () => {
          this.incrementVersions();
        },
        () => {
          this.incrementVersions();
        },
      );
    }
    return result;
  }
}

export default new Main();
