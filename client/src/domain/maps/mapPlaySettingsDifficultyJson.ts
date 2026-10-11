import { PlaySettingsDifficulty } from '@/client/domain/enums.ts';
import I18nLibrary from '@/client/libraries/I18nLibrary.ts';

await I18nLibrary.loadNamespace('map_play_settings_difficulty');

export default function mapPlaySettingsDifficultyJson(difficulty: PlaySettingsDifficulty): string {
  return I18nLibrary.t(
    (
      {
        [PlaySettingsDifficulty.High]: 'map_play_settings_difficulty.high',
        [PlaySettingsDifficulty.Low]: 'map_play_settings_difficulty.low',
        [PlaySettingsDifficulty.Medium]: 'map_play_settings_difficulty.medium',
      } as const
    )[difficulty],
  );
}
