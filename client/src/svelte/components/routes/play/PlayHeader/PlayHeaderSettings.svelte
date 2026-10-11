<script lang="ts">
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import AppRadioGroup from '@/client/svelte/components/shared/AppRadioGroup.svelte';
  import {
    PlayRuntimeHostType,
    PlayRuntimeSettingsDifficulty,
    PlayRuntimeSettingsType,
  } from '@/client/svelte/runes/PlayRuntime.svelte.ts';

  type Props = { onsethosttype: (hostType: PlayRuntimeHostType) => void };

  const { onsethosttype }: Props = $props();

  const runtime = getPlayRuntimeContext();

  await Promise.all([
    I18nLibrary.loadNamespace('com_play_header_settings'),
    I18nLibrary.loadNamespace('map_difficulty_name'),
    I18nLibrary.loadNamespace('map_host_type_name'),
    I18nLibrary.loadNamespace('map_type_name'),
  ]);

  function mapDifficultyName(difficulty: PlayRuntimeSettingsDifficulty): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimeSettingsDifficulty.High]: 'map_difficulty_name.high',
          [PlayRuntimeSettingsDifficulty.Low]: 'map_difficulty_name.low',
          [PlayRuntimeSettingsDifficulty.Medium]: 'map_difficulty_name.medium',
        } as const
      )[difficulty],
    );
  }

  function mapHostTypeName(hostType: PlayRuntimeHostType): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimeHostType.Client]: 'map_host_type_name.client',
          [PlayRuntimeHostType.Server]: 'map_host_type_name.server',
        } as const
      )[hostType],
    );
  }

  function mapTypeName(type: PlayRuntimeSettingsType): string {
    return I18nLibrary.t(
      (
        {
          [PlayRuntimeSettingsType.Classic]: 'map_type_name.classic',
          [PlayRuntimeSettingsType.Random]: 'map_type_name.random',
        } as const
      )[type],
    );
  }
</script>

<form
  class="setup"
  onsubmit={event => {
    event.preventDefault();
  }}
>
  <AppRadioGroup
    legend={I18nLibrary.t('com_play_header_settings.label_host_type')}
    modelValue={runtime.hostType}
    options={[
      { text: mapHostTypeName(PlayRuntimeHostType.Client), value: PlayRuntimeHostType.Client },
      { text: mapHostTypeName(PlayRuntimeHostType.Server), value: PlayRuntimeHostType.Server },
    ]}
    onchange={onsethosttype}
  />
  <AppRadioGroup
    legend={I18nLibrary.t('com_play_header_settings.label_difficulty')}
    modelValue={runtime.settings.difficulty}
    options={[
      { text: mapDifficultyName(PlayRuntimeSettingsDifficulty.Low), value: PlayRuntimeSettingsDifficulty.Low },
      { text: mapDifficultyName(PlayRuntimeSettingsDifficulty.Medium), value: PlayRuntimeSettingsDifficulty.Medium },
      { text: mapDifficultyName(PlayRuntimeSettingsDifficulty.High), value: PlayRuntimeSettingsDifficulty.High },
    ]}
    onchange={difficulty => void runtime.changeSettings({ difficulty })}
  />
  <AppRadioGroup
    legend={I18nLibrary.t('com_play_header_settings.label_bonuses')}
    modelValue={runtime.settings.type}
    options={[
      { text: mapTypeName(PlayRuntimeSettingsType.Classic), value: PlayRuntimeSettingsType.Classic },
      { text: mapTypeName(PlayRuntimeSettingsType.Random), value: PlayRuntimeSettingsType.Random },
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
