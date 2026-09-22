import App from '@/server/app/App.ts';
import AppDependenciesFactory from '@/server/infrastructure/AppDependenciesFactory.ts';
import type { AppBootProgressPublisher } from '@/server/app/types/publishers.ts';

export default function createAppRuntime(): {
  bootProgressPublisher: Pick<AppBootProgressPublisher, 'subscribe'>;
  promise: Promise<App>;
} {
  const dependencies = AppDependenciesFactory.create();
  return {
    bootProgressPublisher: dependencies.publishers.bootProgress,
    promise: App.boot(dependencies),
  };
}
