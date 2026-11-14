import { PlaySettingsType } from '@/client/src/domain/play.ts';
import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('map_play_settings_type');

export default function mapPlaySettingsTypeJson(type: PlaySettingsType): string {
  return L10nBundleAdapter.t(
    (
      {
        [PlaySettingsType.Classic]: 'map_play_settings_type.classic',
        [PlaySettingsType.Random]: 'map_play_settings_type.random',
      } as const
    )[type],
  );
}
