import { PlaySettingsDifficulty } from '@/client/src/domain/play.ts';
import L10nBundleAdapter from '@/client/src/platform/by-port/io/l10n/adapters/bundle.ts';

await L10nBundleAdapter.loadNamespace('map_play_settings_difficulty');

export default function mapPlaySettingsDifficultyJson(difficulty: PlaySettingsDifficulty): string {
  return L10nBundleAdapter.t(
    (
      {
        [PlaySettingsDifficulty.High]: 'map_play_settings_difficulty.high',
        [PlaySettingsDifficulty.Low]: 'map_play_settings_difficulty.low',
        [PlaySettingsDifficulty.Medium]: 'map_play_settings_difficulty.medium',
      } as const
    )[difficulty],
  );
}
