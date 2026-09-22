import { eventsSchemaVersion } from '@/server/infrastructure/constants.ts';
import BrowserSchedulerGateway from '@/server/infrastructure/gateways/BrowserSchedulerGateway.ts';
import CryptoIdentifierGateway from '@/server/infrastructure/gateways/CryptoIdentifierGateway.ts';
import HttpLoaderGateway from '@/server/infrastructure/gateways/HttpLoaderGateway.ts';
import Mulberry32RandomizerGateway from '@/server/infrastructure/gateways/Mulberry32RandomizerGateway.ts';
import WebWorkerTurnGeneratorGateway from '@/server/infrastructure/gateways/WebWorkerTurnGeneratorGateway.ts';
import CallbackBootProgressPublisher from '@/server/infrastructure/publishers/CallbackBootProgressPublisher.ts';
import IndexedDbEventRepository from '@/server/infrastructure/repositories/IndexedDbEventRepository.ts';
import LocalStorageSettingsRepository from '@/server/infrastructure/repositories/LocalStorageSettingsRepository.ts';
import type { AppDependencies } from '@/server/app/types/index.ts';

export default class AppDependenciesFactory {
  private static readonly CONFIG = { dictionaryUrl: '/dictionary.bin' };

  static create(): AppDependencies {
    return {
      config: this.CONFIG,
      gateways: {
        app: {
          loader: HttpLoaderGateway,
          scheduler: BrowserSchedulerGateway,
          turnGenerator: WebWorkerTurnGeneratorGateway,
        },
        domain: {
          identifier: CryptoIdentifierGateway,
          randomizer: Mulberry32RandomizerGateway,
        },
      },
      publishers: { bootProgress: new CallbackBootProgressPublisher() },
      repositories: {
        events: new IndexedDbEventRepository(eventsSchemaVersion),
        settings: new LocalStorageSettingsRepository(),
      },
    };
  }
}
