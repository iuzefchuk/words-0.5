import { DomainTurnGenerator } from '@/server/app/types/index.ts';
import { DomainDictionary } from '@/server/app/types/index.ts';
import CryptoIdentifierGateway from '@/server/infrastructure/gateways/CryptoIdentifierGateway.ts';
import {
  TurnGenerationWorkerRequestType,
  TurnGenerationWorkerResponseType,
} from '@/server/infrastructure/workers/turnGenerator.protocol.ts';
import type { DomainTurnGenerationResult } from '@/server/app/types/index.ts';
import type {
  TurnGenerationWorkerInput,
  TurnGenerationWorkerRequest,
} from '@/server/infrastructure/workers/turnGenerator.protocol.ts';

class TurnGeneratorWorker {
  private dictionary: DomainDictionary | null = null;

  handleMessage(event: MessageEvent<TurnGenerationWorkerRequest>): void {
    if (event.data.type === TurnGenerationWorkerRequestType.Init) {
      this.init(event.data.input);
    } else {
      this.stream(event.data.input);
    }
  }

  private findBestResult(input: TurnGenerationWorkerInput): DomainTurnGenerationResult | null {
    if (this.dictionary === null) throw new Error('worker dictionary is not initialized');
    const dictionary = this.dictionary;
    const context = DomainTurnGenerator.hydrateContext(input, dictionary, input.crossCheckBuffer, CryptoIdentifierGateway);
    let bestResult: DomainTurnGenerationResult | null = null;
    let bestScore = -1;
    let count = 0;
    for (const result of DomainTurnGenerator.execute(context, input.player, input.partition)) {
      if (result.evaluation.computation.score > bestScore) {
        bestResult = result;
        bestScore = result.evaluation.computation.score;
      }
      if (++count >= input.attemptsLimit) break;
    }
    return bestResult;
  }

  private init(buffer: ArrayBufferLike): void {
    this.dictionary = DomainDictionary.create(buffer);
    self.postMessage({ type: TurnGenerationWorkerResponseType.Ready });
  }

  private stream(input: TurnGenerationWorkerInput): void {
    const bestResult = this.findBestResult(input);
    if (bestResult !== null) {
      self.postMessage({ type: TurnGenerationWorkerResponseType.Result, value: bestResult });
    }
    self.postMessage({ type: TurnGenerationWorkerResponseType.Done });
  }
}

const handler = new TurnGeneratorWorker();

self.onmessage = (event: MessageEvent<TurnGenerationWorkerRequest>) => {
  try {
    handler.handleMessage(event);
  } catch (error) {
    self.postMessage({ error: String(error), type: TurnGenerationWorkerResponseType.Error });
  }
};
