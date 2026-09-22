import {
  TurnGenerationWorkerRequestType,
  TurnGenerationWorkerResponseType,
} from '@/infrastructure/workers/turnGenerator.protocol.ts';
import TurnGenerationWorker from '@/infrastructure/workers/turnGenerator.worker.ts?worker';
import type { DomainMatchPlayer } from '@/app/enums/index.ts';
import type { AppTurnGeneratorGateway } from '@/app/types/gateways.ts';
import type { DomainTurnGenerationContext, DomainTurnGenerationResult } from '@/app/types/index.ts';
import type {
  TurnGenerationWorkerInput,
  TurnGenerationWorkerRequest,
  TurnGenerationWorkerResponse,
} from '@/infrastructure/workers/turnGenerator.protocol.ts';

type DictionaryBuffer = ArrayBufferLike;

type TurnGenerationWorkerConstructor = new () => Worker;

export default class WebWorkerTurnGeneratorGateway {
  private static dictionaryBuffer: DictionaryBuffer | null = null;

  private static initPromise: null | Promise<void> = null;

  private static pool: Array<Worker> = [];

  private static readonly WORKER_CONSTRUCTOR: TurnGenerationWorkerConstructor = TurnGenerationWorker;

  static async generateBestResult(input: {
    attemptsLimit: number;
    context: DomainTurnGenerationContext;
    player: DomainMatchPlayer;
  }): Promise<DomainTurnGenerationResult | null> {
    if (this.initPromise === null) throw new Error('turn generator is not initialized');
    await this.initPromise;
    const workerInput = this.createWorkerInput(input);
    const inputs =
      input.attemptsLimit === Infinity
        ? this.partitionWorkerInput(workerInput, input.context.match.anchorCells.size)
        : [workerInput];
    return this.findBestResult(await this.generateResults(inputs));
  }

  static init(buffer: DictionaryBuffer): Promise<void> {
    this.dictionaryBuffer = buffer;
    if (this.pool.length === 0) this.spawn();
    this.initPromise = Promise.all(this.pool.map(worker => this.initWorker(worker, buffer))).then(() => undefined);
    void this.initPromise.catch(() => undefined);
    return this.initPromise;
  }

  static spawn(): void {
    if (this.pool.length > 0) return;
    this.pool = Array.from({ length: this.computePoolSize() }, () => this.createWorker());
  }

  private static computePoolSize(): number {
    const navigator = globalThis.navigator as ({ deviceMemory?: number } & Navigator) | undefined;
    const sizeHint = navigator?.deviceMemory ?? (navigator?.hardwareConcurrency ?? 2) / 2;
    return Math.min(8, Math.max(1, Math.floor(sizeHint)));
  }

  private static createWorker(): Worker {
    return new this.WORKER_CONSTRUCTOR();
  }

  private static createWorkerInput({
    attemptsLimit,
    context,
    player,
  }: {
    attemptsLimit: number;
    context: DomainTurnGenerationContext;
    player: DomainMatchPlayer;
  }): TurnGenerationWorkerInput {
    const { crossCheckTable, match } = context;
    return {
      attemptsLimit,
      crossCheckBuffer: crossCheckTable.buffer,
      match,
      player,
    };
  }

  private static findBestResult(results: ReadonlyArray<DomainTurnGenerationResult>): DomainTurnGenerationResult | null {
    let bestResult: DomainTurnGenerationResult | null = null;
    let bestScore = -1;
    for (const result of results) {
      if (result.evaluation.computation.score > bestScore) {
        bestResult = result;
        bestScore = result.evaluation.computation.score;
      }
    }
    return bestResult;
  }

  private static generateResult(worker: Worker, input: TurnGenerationWorkerInput): Promise<DomainTurnGenerationResult | null> {
    return new Promise((resolve, reject) => {
      let result: DomainTurnGenerationResult | null = null;
      worker.onmessage = (event: MessageEvent<TurnGenerationWorkerResponse>) => {
        if (event.data.type === TurnGenerationWorkerResponseType.Done) resolve(result);
        else if (event.data.type === TurnGenerationWorkerResponseType.Error) reject(new Error(event.data.error));
        else if (event.data.type === TurnGenerationWorkerResponseType.Result) result = event.data.value;
        else reject(new Error(`expected worker generation response, got ${event.data.type}`));
      };
      worker.onerror = () => {
        reject(new Error('worker error'));
      };
      worker.postMessage({
        input,
        type: TurnGenerationWorkerRequestType.Generate,
      } satisfies TurnGenerationWorkerRequest);
    });
  }

  private static async generateResults(
    inputs: ReadonlyArray<TurnGenerationWorkerInput>,
  ): Promise<Array<DomainTurnGenerationResult>> {
    const jobs = await Promise.all(inputs.map(async input => ({ input, worker: await this.takeOrCreateWorker() })));
    try {
      const results = await Promise.all(jobs.map(({ input, worker }) => this.generateResult(worker, input)));
      this.pool.push(...jobs.map(({ worker }) => worker));
      return results.filter((result): result is DomainTurnGenerationResult => result !== null);
    } catch (error) {
      for (const { worker } of jobs) worker.terminate();
      throw error;
    }
  }

  private static getDictionaryBuffer(): DictionaryBuffer {
    if (this.dictionaryBuffer === null) throw new Error('turn generator dictionary is not initialized');
    return this.dictionaryBuffer;
  }

  private static initWorker(worker: Worker, buffer: DictionaryBuffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<TurnGenerationWorkerResponse>) => {
        if (event.data.type === TurnGenerationWorkerResponseType.Ready) resolve();
        else if (event.data.type === TurnGenerationWorkerResponseType.Error) reject(new Error(event.data.error));
        else reject(new Error(`expected worker Ready response, got ${event.data.type}`));
      };
      worker.onerror = () => {
        reject(new Error('worker error'));
      };
      worker.postMessage({
        input: buffer,
        type: TurnGenerationWorkerRequestType.Init,
      } satisfies TurnGenerationWorkerRequest);
    });
  }

  private static partitionWorkerInput(
    workerInput: TurnGenerationWorkerInput,
    anchorCount: number,
  ): Array<TurnGenerationWorkerInput> {
    const workerCount = Math.min(this.pool.length, anchorCount);
    if (workerCount <= 1) return [workerInput];
    const inputs: Array<TurnGenerationWorkerInput> = [];
    for (let idx = 0; idx < workerCount; idx++) {
      const offset = Math.round((anchorCount * idx) / workerCount);
      const end = Math.round((anchorCount * (idx + 1)) / workerCount);
      inputs.push({ ...workerInput, partition: { length: end - offset, offset } });
    }
    return inputs;
  }

  private static async takeOrCreateWorker(): Promise<Worker> {
    const pooled = this.pool.pop();
    if (pooled !== undefined) return pooled;
    const worker = this.createWorker();
    await this.initWorker(worker, this.getDictionaryBuffer());
    return worker;
  }
}

WebWorkerTurnGeneratorGateway satisfies AppTurnGeneratorGateway;
