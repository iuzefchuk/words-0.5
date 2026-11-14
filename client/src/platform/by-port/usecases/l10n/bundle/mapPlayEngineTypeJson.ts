import { PlayEngineType } from '@/client/src/domain/play.ts';
import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('map_play_engine_type');

export default function mapPlayEngineTypeJson(engineType: PlayEngineType): string {
  return L10nBundleAdapter.t(
    (
      {
        [PlayEngineType.Client]: 'map_play_engine_type.client',
        [PlayEngineType.Server]: 'map_play_engine_type.server',
      } as const
    )[engineType],
  );
}
