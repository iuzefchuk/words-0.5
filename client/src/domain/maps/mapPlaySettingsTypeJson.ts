import { PlaySettingsType } from '@/client/domain/enums/PlaySettingsType.ts';
import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

await I18nLibrary.loadNamespace('map_play_settings_type');

export default function mapPlaySettingsTypeJson(type: PlaySettingsType): string {
  return I18nLibrary.t(
    (
      {
        [PlaySettingsType.Classic]: 'map_play_settings_type.classic',
        [PlaySettingsType.Random]: 'map_play_settings_type.random',
      } as const
    )[type],
  );
}
