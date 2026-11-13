import { PlaySettingsType } from '@/client/src/domain/play.ts';
import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

await I18nJsonAdapter.loadNamespace('map_play_settings_type');

export default function mapPlaySettingsTypeJson(type: PlaySettingsType): string {
  return I18nJsonAdapter.t(
    (
      {
        [PlaySettingsType.Classic]: 'map_play_settings_type.classic',
        [PlaySettingsType.Random]: 'map_play_settings_type.random',
      } as const
    )[type],
  );
}
