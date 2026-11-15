<script module lang="ts">
  import { PlayEngineType, PlaySettingsDifficulty, PlaySettingsType } from '@/client/src/domain/play.ts';
  import L10nGlobAdapter from '@/client/src/platform/by-port/l10n/adapters/glob.ts';

  function comPlayHeaderSettings(key: string, props?: Record<string, number | string>): string {
    return L10nGlobAdapter.t(`com_play_header_settings.${key}`, props);
  }

  function mapPlayEngineType(engineType: PlayEngineType): string {
    return L10nGlobAdapter.t(
      (
        {
          [PlayEngineType.Client]: 'map_play_engine_type.client',
          [PlayEngineType.Server]: 'map_play_engine_type.server',
        } as const
      )[engineType],
    );
  }

  function mapPlaySettingsDifficulty(difficulty: PlaySettingsDifficulty): string {
    return L10nGlobAdapter.t(
      (
        {
          [PlaySettingsDifficulty.High]: 'map_play_settings_difficulty.high',
          [PlaySettingsDifficulty.Low]: 'map_play_settings_difficulty.low',
          [PlaySettingsDifficulty.Medium]: 'map_play_settings_difficulty.medium',
        } as const
      )[difficulty],
    );
  }

  function mapPlaySettingsType(type: PlaySettingsType): string {
    return L10nGlobAdapter.t(
      (
        {
          [PlaySettingsType.Classic]: 'map_play_settings_type.classic',
          [PlaySettingsType.Random]: 'map_play_settings_type.random',
        } as const
      )[type],
    );
  }
</script>

<script lang="ts">
  import AppRadioGroup from '@/client/src/fw/ui/by-design/AppRadioGroup.svelte';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';

  type Props = { onsetenginetype: (engineType: PlayEngineType) => void };

  const { onsetenginetype }: Props = $props();

  const runtime = getPlayRuntimeContext();
</script>

<form
  class="setup"
  onsubmit={event => {
    event.preventDefault();
  }}
>
  <AppRadioGroup
    legend={comPlayHeaderSettings('label_engine_type')}
    modelValue={runtime.engineType}
    options={[
      { text: mapPlayEngineType(PlayEngineType.Client), value: PlayEngineType.Client },
      { text: mapPlayEngineType(PlayEngineType.Server), value: PlayEngineType.Server },
    ]}
    onchange={onsetenginetype}
  />
  <AppRadioGroup
    legend={comPlayHeaderSettings('label_difficulty')}
    modelValue={runtime.settings.difficulty}
    options={[
      { text: mapPlaySettingsDifficulty(PlaySettingsDifficulty.Low), value: PlaySettingsDifficulty.Low },
      { text: mapPlaySettingsDifficulty(PlaySettingsDifficulty.Medium), value: PlaySettingsDifficulty.Medium },
      { text: mapPlaySettingsDifficulty(PlaySettingsDifficulty.High), value: PlaySettingsDifficulty.High },
    ]}
    onchange={difficulty => void runtime.changeSettings({ difficulty })}
  />
  <AppRadioGroup
    legend={comPlayHeaderSettings('label_bonuses')}
    modelValue={runtime.settings.type}
    options={[
      { text: mapPlaySettingsType(PlaySettingsType.Classic), value: PlaySettingsType.Classic },
      { text: mapPlaySettingsType(PlaySettingsType.Random), value: PlaySettingsType.Random },
    ]}
    onchange={type => void runtime.changeSettings({ type })}
  />
</form>

<style>
  .setup {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
  }
</style>
