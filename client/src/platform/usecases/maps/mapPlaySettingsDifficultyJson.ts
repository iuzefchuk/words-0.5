import { PlaySettingsDifficulty } from '@/client/src/domain/play.ts';
import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';

await I18nJsonAdapter.loadNamespace('map_play_settings_difficulty');

export default function mapPlaySettingsDifficultyJson(difficulty: PlaySettingsDifficulty): string {
  return I18nJsonAdapter.t(
    (
      {
        [PlaySettingsDifficulty.High]: 'map_play_settings_difficulty.high',
        [PlaySettingsDifficulty.Low]: 'map_play_settings_difficulty.low',
        [PlaySettingsDifficulty.Medium]: 'map_play_settings_difficulty.medium',
      } as const
    )[difficulty],
  );
}
