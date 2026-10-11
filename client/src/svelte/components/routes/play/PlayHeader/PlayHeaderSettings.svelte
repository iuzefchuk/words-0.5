<script lang="ts">
  import { PlayHostType, PlaySettingsDifficulty, PlaySettingsType } from '@/client/domain/enums.ts';
  import mapPlayHostTypeJson from '@/client/domain/maps/mapPlayHostTypeJson.ts';
  import mapPlaySettingsDifficultyJson from '@/client/domain/maps/mapPlaySettingsDifficultyJson.ts';
  import mapPlaySettingsTypeJson from '@/client/domain/maps/mapPlaySettingsTypeJson.ts';
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import AppRadioGroup from '@/client/svelte/components/shared/AppRadioGroup.svelte';

  type Props = { onsethosttype: (hostType: PlayHostType) => void };

  const { onsethosttype }: Props = $props();

  const runtime = getPlayRuntimeContext();

  await I18nLibrary.loadNamespace('com_play_header_settings');
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
      { text: mapPlayHostTypeJson(PlayHostType.Client), value: PlayHostType.Client },
      { text: mapPlayHostTypeJson(PlayHostType.Server), value: PlayHostType.Server },
    ]}
    onchange={onsethosttype}
  />
  <AppRadioGroup
    legend={I18nLibrary.t('com_play_header_settings.label_difficulty')}
    modelValue={runtime.settings.difficulty}
    options={[
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Low), value: PlaySettingsDifficulty.Low },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Medium), value: PlaySettingsDifficulty.Medium },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.High), value: PlaySettingsDifficulty.High },
    ]}
    onchange={difficulty => void runtime.changeSettings({ difficulty })}
  />
  <AppRadioGroup
    legend={I18nLibrary.t('com_play_header_settings.label_bonuses')}
    modelValue={runtime.settings.type}
    options={[
      { text: mapPlaySettingsTypeJson(PlaySettingsType.Classic), value: PlaySettingsType.Classic },
      { text: mapPlaySettingsTypeJson(PlaySettingsType.Random), value: PlaySettingsType.Random },
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
