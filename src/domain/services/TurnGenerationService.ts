import Match from '@/domain/entities/Match.ts';
import Playfield from '@/domain/entities/Playfield.ts';
import ShuffleService from '@/domain/services/ShuffleService.ts';
import TurnEvaluationService from '@/domain/services/TurnEvaluationService.ts';
import CrossCheckTable from '@/domain/value-objects/classes/CrossCheckTable.ts';
import {
  PlayfieldAxis,
  TurnGenerationCommandType,
  TurnGenerationDirection,
  TurnGenerationTask,
  TurnValidity,
} from '@/domain/value-objects/enums.ts';
import type { InventoryLetter, MatchPlayer } from '@/domain/value-objects/enums.ts';
import type {
  DictionaryGraph,
  DictionaryNode,
  IdentifierGateway,
  InventoryTile,
  InventoryTileCollection,
  PlayfieldAnchorCoordinates,
  PlayfieldCell,
  TurnGenerationContext,
  TurnGenerationPartition,
  TurnGenerationResult,
  TurnLink,
} from '@/domain/value-objects/types.ts';

type ApplyTask = {
  candidate: Candidate;
  resolution: Resolution;
  resolutionComputeds: ResolutionComputeds;
  traversal: Traversal;
  type: TurnGenerationTask.ApplyResolution;
};

type CalculateTask = { traversal: Traversal; type: TurnGenerationTask.CalculateCandidate };

type Candidate = { cell: PlayfieldCell; position: number; resolution: Resolution | undefined };

type ContinueTaskCommand = { newTasks: Array<Task>; type: TurnGenerationCommandType.ContinueExecute };

type DispatcherComputeds = { axisCells: ReadonlyArray<PlayfieldCell>; oppositeAxis: PlayfieldAxis };

type DispatcherState = { placement: Array<TurnLink>; tiles: MutableTileCollection };

type EvaluateTask = { traversal: Traversal; type: TurnGenerationTask.EvaluateTraversal };

type GeneratorArguments = {
  context: TurnGenerationContext;
  coords: PlayfieldAnchorCoordinates;
  playerTileCollection: InventoryTileCollection;
};

type MutableTileCollection = Map<InventoryLetter, Array<InventoryTile>>;

type Resolution = { tile: InventoryTile };

type ResolutionComputeds = { letterTiles: Array<InventoryTile> };

type ResolveTask = { candidate: Candidate; traversal: Traversal; type: TurnGenerationTask.ResolveCandidate };

type ReturnTaskCommand = { result: TurnGenerationResult; type: TurnGenerationCommandType.ReturnResult };

type ReverseTask = {
  resolution: Resolution;
  resolutionComputeds: ResolutionComputeds;
  traversal: Traversal;
  type: TurnGenerationTask.ReverseResolution;
};

type StopTaskCommand = { type: TurnGenerationCommandType.StopExecute };

type Task = ApplyTask | CalculateTask | EvaluateTask | ResolveTask | ReverseTask | ValidateTask;

type TaskCommand = ContinueTaskCommand | ReturnTaskCommand | StopTaskCommand;

type Traversal = { direction: TurnGenerationDirection; node: DictionaryNode; position: number };

type ValidateTask = { traversal: Traversal; type: TurnGenerationTask.ValidateTraversal };

class CrossChecker {
  private constructor(
    private readonly match: Match,
    private readonly dictionary: DictionaryGraph,
  ) {}

  static precompute(match: Match, dictionary: DictionaryGraph): CrossCheckTable {
    const service = new CrossChecker(match, dictionary);
    const table = CrossCheckTable.create(Playfield.CELLS.length);
    for (const axis of Object.values(PlayfieldAxis)) {
      for (const cell of Playfield.CELLS) {
        table.setMask(axis, cell, service.computeFor({ axis, cell }));
      }
    }
    return table;
  }

  private collectAdjacentTileLetters(axisCells: ReadonlyArray<PlayfieldCell>, startPosition: number, direction: -1 | 1): string {
    let result = '';
    for (let idx = startPosition + direction; idx >= 0 && idx < axisCells.length; idx += direction) {
      const cell = axisCells[idx];
      if (cell === undefined) throw new ReferenceError(`expected cell at index ${String(idx)}, got undefined`);
      const tile = this.match.findTileByCell(cell);
      if (tile === undefined) break;
      const letter = this.match.getTileLetter(tile);
      result = direction === -1 ? letter + result : result + letter;
    }
    return result;
  }

  private computeFor(coords: PlayfieldAnchorCoordinates): number {
    const axisCells = Playfield.getAxisCells(coords);
    const position =
      coords.axis === PlayfieldAxis.X
        ? Playfield.getCellPositionInColumn(coords.cell)
        : Playfield.getCellPositionInRow(coords.cell);
    const prefix = this.collectAdjacentTileLetters(axisCells, position, -1);
    const suffix = this.collectAdjacentTileLetters(axisCells, position, 1);
    if (prefix === '' && suffix === '') return CrossCheckTable.ALL_LETTERS_MASK;
    const prefixNode = prefix !== '' ? this.dictionary.getNode(prefix) : this.dictionary.rootNode;
    if (prefixNode === null) return 0;
    let mask = 0;
    this.dictionary.forEachNodeChild(prefixNode, (_letter, nodeWithPossibleNextLetter, letterIndex) => {
      if (suffix === '') {
        mask |= 1 << letterIndex;
        return;
      }
      const suffixNode = this.dictionary.getNode(suffix, nodeWithPossibleNextLetter);
      if (suffixNode !== null && this.dictionary.isNodeFinal(suffixNode)) mask |= 1 << letterIndex;
    });
    return mask;
  }
}

class TaskCommandResolver {
  private constructor(private readonly stack: Array<Task>) {}

  static continueExecute(newTasks: Array<Task>): ContinueTaskCommand {
    return { newTasks, type: TurnGenerationCommandType.ContinueExecute };
  }

  static create(firstTask: Task): TaskCommandResolver {
    const tasks = [firstTask];
    return new TaskCommandResolver(tasks);
  }

  static returnResult(result: TurnGenerationResult): ReturnTaskCommand {
    return { result, type: TurnGenerationCommandType.ReturnResult };
  }

  static stopExecute(): StopTaskCommand {
    return { type: TurnGenerationCommandType.StopExecute };
  }

  *execute(dispatcher: (task: Task) => TaskCommand): Generator<TurnGenerationResult> {
    while (this.stack.length > 0) {
      const task = this.popFromStack();
      const command = dispatcher(task);
      if (command.type === TurnGenerationCommandType.ContinueExecute) this.pushToStack(command.newTasks);
      if (command.type === TurnGenerationCommandType.ReturnResult) yield command.result;
    }
  }

  private popFromStack(): Task {
    const lastTask = this.stack.pop();
    if (lastTask === undefined) throw new ReferenceError('cannot pop task: stack is empty');
    return lastTask;
  }

  private pushToStack(tasks: Array<Task>): void {
    for (let idx = tasks.length - 1; idx >= 0; idx--) {
      const task = tasks[idx];
      if (task === undefined) throw new ReferenceError(`expected task at index ${String(idx)}, got undefined`);
      this.stack.push(task);
    }
  }
}

class TaskDispatcher {
  private get match(): Match {
    return this.context.match;
  }

  private get placement(): Array<TurnLink> {
    return this.state.placement;
  }

  private get tiles(): MutableTileCollection {
    return this.state.tiles;
  }

  private constructor(
    private readonly context: TurnGenerationContext,
    private readonly state: DispatcherState,
    public computeds: DispatcherComputeds,
  ) {}

  static create({ context, coords, playerTileCollection }: GeneratorArguments): TaskDispatcher {
    const tiles: MutableTileCollection = new Map();
    for (const [letter, tileIds] of playerTileCollection) tiles.set(letter, [...tileIds]);
    const state: DispatcherState = { placement: [], tiles };
    const computeds: DispatcherComputeds = {
      axisCells: Playfield.getAxisCells(coords),
      oppositeAxis: Playfield.getOppositeAxis(coords.axis),
    };
    return new TaskDispatcher(context, state, computeds);
  }

  *dispatchTraversal(anchorPos: number): Generator<TurnGenerationResult> {
    try {
      const { axisCells } = this.computeds;
      const leftCell = anchorPos > 0 ? axisCells[anchorPos - 1] : undefined;
      const leftOccupied = leftCell !== undefined && this.match.findTileByCell(leftCell) !== undefined;
      if (leftOccupied) {
        let startPos = anchorPos - 1;
        while (startPos > 0) {
          const cell = axisCells[startPos - 1];
          if (cell === undefined || this.match.findTileByCell(cell) === undefined) break;
          startPos--;
        }
        let node = this.context.dictionary.rootNode;
        for (let pos = startPos; pos < anchorPos; pos++) {
          const cell = axisCells[pos];
          if (cell === undefined) return;
          const tile = this.match.findTileByCell(cell);
          if (tile === undefined) return;
          const next = this.context.dictionary.getNode(this.match.getTileLetter(tile), node);
          if (next === null) return;
          node = next;
        }
        yield* this.traverseRight(node, anchorPos);
      } else {
        let leftLimit = 0;
        for (let pos = anchorPos - 1; pos >= 0; pos--) {
          const cell = axisCells[pos];
          if (cell === undefined || this.match.findTileByCell(cell) !== undefined) break;
          leftLimit++;
        }
        yield* this.traverseLeft(anchorPos, leftLimit);
      }
    } finally {
      this.restorePlacements();
    }
  }

  execute(task: Task): TaskCommand {
    switch (task.type) {
      case TurnGenerationTask.ApplyResolution:
        return this.applyResolution(task);
      case TurnGenerationTask.CalculateCandidate:
        return this.calculateCandidate(task);
      case TurnGenerationTask.EvaluateTraversal:
        return this.evaluateTraversal(task);
      case TurnGenerationTask.ResolveCandidate:
        return this.resolveCandidate(task);
      case TurnGenerationTask.ReverseResolution:
        return this.reverseResolution(task);
      case TurnGenerationTask.ValidateTraversal:
        return this.validateTraversal(task);
    }
  }

  private applyResolution(task: ApplyTask): ContinueTaskCommand {
    const { cell } = task.candidate;
    const { tile } = task.resolution;
    const { letterTiles } = task.resolutionComputeds;
    letterTiles.pop();
    this.placement.push({ cell, tile });
    this.match.placeTile(cell, tile);
    return this.emitContinue();
  }

  private calculateAndExploreResolution(traversal: Traversal, candidate: Candidate): ContinueTaskCommand | StopTaskCommand {
    const { cell, position } = candidate;
    const anchorMask = this.context.crossCheckTable.getMask(this.computeds.oppositeAxis, cell);
    const newTasks: Array<Task> = [];
    this.context.dictionary.forEachNodeChild(traversal.node, (possibleNextLetter, nodeWithPossibleNextLetter, letterIndex) => {
      if (((anchorMask >>> letterIndex) & 1) === 0) return;
      const letterTiles = this.tiles.get(possibleNextLetter);
      if (letterTiles === undefined) return;
      const tile = letterTiles.at(-1);
      if (tile === undefined) return;
      const resolution: Resolution = { tile };
      const resolutionComputeds: ResolutionComputeds = { letterTiles };
      const applyTask: ApplyTask = {
        candidate,
        resolution,
        resolutionComputeds,
        traversal,
        type: TurnGenerationTask.ApplyResolution,
      };
      const evaluateTask: EvaluateTask = {
        traversal: { ...traversal, node: nodeWithPossibleNextLetter, position },
        type: TurnGenerationTask.EvaluateTraversal,
      };
      const reverseTask: ReverseTask = {
        resolution,
        resolutionComputeds,
        traversal,
        type: TurnGenerationTask.ReverseResolution,
      };
      newTasks.push(applyTask, evaluateTask, reverseTask);
    });
    if (newTasks.length === 0) return this.emitStop();
    ShuffleService.shuffle({ array: newTasks, groupSize: 3 });
    return this.emitContinue(newTasks);
  }

  private calculateCandidate(task: CalculateTask): ContinueTaskCommand {
    const { traversal } = task;
    const position = traversal.position + traversal.direction;
    const cell = this.computeds.axisCells[position];
    if (cell === undefined) throw new ReferenceError(`expected cell at position ${String(position)}, got undefined`);
    const tile = this.match.findTileByCell(cell);
    const resolution: Resolution | undefined = tile !== undefined ? { tile } : undefined;
    const candidate: Candidate = { cell, position, resolution };
    return this.emitContinue([{ ...task, candidate, type: TurnGenerationTask.ResolveCandidate }]);
  }

  private createTraversalFromCandidate(traversal: Traversal, candidate: Candidate): ContinueTaskCommand | StopTaskCommand {
    const { position, resolution } = candidate;
    if (resolution === undefined) throw new ReferenceError('expected candidate resolution, got undefined');
    const nextNode = this.context.dictionary.getNode(this.match.getTileLetter(resolution.tile), traversal.node);
    if (nextNode === null) return this.emitStop();
    const traversalFromCandidate: Traversal = { ...traversal, node: nextNode, position };
    return this.emitContinue([{ traversal: traversalFromCandidate, type: TurnGenerationTask.EvaluateTraversal }]);
  }

  private emitContinue(newTasks: Array<Task> = []): ContinueTaskCommand {
    return TaskCommandResolver.continueExecute(newTasks);
  }

  private emitReturn(result: TurnGenerationResult): ReturnTaskCommand {
    return TaskCommandResolver.returnResult(result);
  }

  private emitStop(): StopTaskCommand {
    return TaskCommandResolver.stopExecute();
  }

  private evaluateTraversal(task: EvaluateTask): ContinueTaskCommand | ReturnTaskCommand {
    const { traversal } = task;
    const placementIsUsable = this.placement.length > 0 && this.context.dictionary.isNodeFinal(traversal.node);
    if (placementIsUsable) {
      const evaluation = TurnEvaluationService.execute({ dictionary: this.context.dictionary, match: this.match });
      if (evaluation.status === TurnValidity.Valid) {
        return this.emitReturn({ evaluation, placement: [...this.placement] });
      }
    }
    return this.emitContinue([{ ...task, type: TurnGenerationTask.ValidateTraversal }]);
  }

  private *extendLeftPart(
    node: DictionaryNode,
    anchorPos: number,
    length: number,
    depth: number,
  ): Generator<TurnGenerationResult> {
    if (depth === length) {
      yield* this.traverseRight(node, anchorPos);
      return;
    }
    const cell = this.computeds.axisCells[anchorPos - length + depth];
    if (cell === undefined) return;
    const mask = this.context.crossCheckTable.getMask(this.computeds.oppositeAxis, cell);
    const children: Array<{ childNode: DictionaryNode; letter: InventoryLetter }> = [];
    this.context.dictionary.forEachNodeChild(node, (letter, childNode, letterIndex) => {
      if (((mask >>> letterIndex) & 1) === 0) return;
      children.push({ childNode, letter });
    });
    ShuffleService.shuffle({ array: children });
    for (const { childNode, letter } of children) {
      const letterTiles = this.tiles.get(letter);
      if (letterTiles === undefined || letterTiles.length === 0) continue;
      const tile = letterTiles.pop();
      if (tile === undefined) continue;
      this.placement.push({ cell, tile });
      this.match.placeTile(cell, tile);
      yield* this.extendLeftPart(childNode, anchorPos, length, depth + 1);
      this.match.undoPlaceTile(tile);
      this.placement.pop();
      letterTiles.push(tile);
    }
  }

  private resolveCandidate(task: ResolveTask): ContinueTaskCommand | StopTaskCommand {
    const { candidate, traversal } = task;
    return candidate.resolution !== undefined
      ? this.createTraversalFromCandidate(traversal, candidate)
      : this.calculateAndExploreResolution(traversal, candidate);
  }

  private restorePlacements(): void {
    while (this.placement.length > 0) {
      const link = this.placement.pop();
      if (link === undefined) break;
      this.match.undoPlaceTile(link.tile);
      this.tiles.get(this.match.getTileLetter(link.tile))?.push(link.tile);
    }
  }

  private reverseResolution(task: ReverseTask): ContinueTaskCommand {
    const { tile } = task.resolution;
    const { letterTiles } = task.resolutionComputeds;
    letterTiles.push(tile);
    this.placement.pop();
    this.match.undoPlaceTile(tile);
    return this.emitContinue();
  }

  private *traverseLeft(anchorPos: number, leftLimit: number): Generator<TurnGenerationResult> {
    for (let length = 0; length <= leftLimit; length++) {
      yield* this.extendLeftPart(this.context.dictionary.rootNode, anchorPos, length, 0);
    }
  }

  private *traverseRight(node: DictionaryNode, anchorPos: number): Generator<TurnGenerationResult> {
    const firstTask: EvaluateTask = {
      traversal: { direction: TurnGenerationDirection.Right, node, position: anchorPos - 1 },
      type: TurnGenerationTask.EvaluateTraversal,
    };
    const resolver = TaskCommandResolver.create(firstTask);
    yield* resolver.execute(task => this.execute(task));
  }

  private validateTraversal(task: ValidateTask): ContinueTaskCommand | StopTaskCommand {
    const { traversal } = task;
    if (Playfield.isCellPositionAtAxisEnd(traversal.position)) return this.emitStop();
    return this.emitContinue([{ ...task, type: TurnGenerationTask.CalculateCandidate }]);
  }
}

export default class TurnGenerationService {
  static createContext(match: Match, dictionary: DictionaryGraph): TurnGenerationContext {
    const clonedMatch = Match.clone(match);
    return {
      crossCheckTable: CrossChecker.precompute(clonedMatch, dictionary),
      dictionary,
      match: clonedMatch,
    };
  }

  static *execute(
    context: TurnGenerationContext,
    player: MatchPlayer,
    partition?: TurnGenerationPartition,
  ): Generator<TurnGenerationResult> {
    const { match } = context;
    const playerTileCollection = match.getTileCollectionFor(player);
    if (playerTileCollection.size === 0) return;
    const { anchorCells } = match;
    if (anchorCells.size === 0) return;
    const allAnchors = Array.from(anchorCells);
    const anchors =
      partition !== undefined ? allAnchors.slice(partition.offset, partition.offset + partition.length) : allAnchors;
    if (anchors.length === 0) return;
    for (const cell of anchors) {
      for (const axis of Object.values(PlayfieldAxis)) {
        const coords: PlayfieldAnchorCoordinates = { axis, cell };
        yield* this.generate({ context, coords, playerTileCollection });
      }
    }
  }

  static hydrateContext(
    data: unknown,
    dictionary: DictionaryGraph,
    crossCheckBuffer: ArrayBuffer | SharedArrayBuffer,
    identifier: IdentifierGateway,
  ): TurnGenerationContext {
    const source = data as { match: Match };
    const clonedMatch = Match.clone(source.match, identifier);
    return {
      crossCheckTable: CrossCheckTable.createFromBuffer(crossCheckBuffer, Playfield.CELLS.length),
      dictionary,
      match: clonedMatch,
    };
  }

  private static *generate(args: GeneratorArguments): Generator<TurnGenerationResult> {
    const { coords } = args;
    const dispatcher = TaskDispatcher.create(args);
    const anchorPos = dispatcher.computeds.axisCells.indexOf(coords.cell);
    yield* dispatcher.dispatchTraversal(anchorPos);
  }
}
