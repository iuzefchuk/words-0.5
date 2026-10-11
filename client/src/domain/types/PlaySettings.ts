import type { PlaySettingsDifficulty } from '@/client/domain/enums/PlaySettingsDifficulty.ts';
import type { PlaySettingsType } from '@/client/domain/enums/PlaySettingsType.ts';

export type PlaySettings = {
  readonly difficulty: PlaySettingsDifficulty;
  readonly type: PlaySettingsType;
};
