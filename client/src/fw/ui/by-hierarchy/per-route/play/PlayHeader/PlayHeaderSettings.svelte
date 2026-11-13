<script lang="ts">
  import { PlayHostType, PlaySettingsDifficulty, PlaySettingsType } from '@/client/src/domain/play.ts';
  import AppRadioGroup from '@/client/src/fw/ui/by-design/AppRadioGroup.svelte';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import I18nJsonAdapter from '@/client/src/platform/infra/i18n/adapters/json.ts';
  import mapPlayHostTypeJson from '@/client/src/platform/usecases/maps/mapPlayHostTypeJson.ts';
  import mapPlaySettingsDifficultyJson from '@/client/src/platform/usecases/maps/mapPlaySettingsDifficultyJson.ts';
  import mapPlaySettingsTypeJson from '@/client/src/platform/usecases/maps/mapPlaySettingsTypeJson.ts';

  type Props = { onsethosttype: (hostType: PlayHostType) => void };

  const { onsethosttype }: Props = $props();

  const runtime = getPlayRuntimeContext();

  await I18nJsonAdapter.loadNamespace('com_play_header_settings');
</script>

<form
  class="setup"
  onsubmit={event => {
    event.preventDefault();
  }}
>
  <AppRadioGroup
    legend={I18nJsonAdapter.t('com_play_header_settings.label_host_type')}
    modelValue={runtime.hostType}
    options={[
      { text: mapPlayHostTypeJson(PlayHostType.Client), value: PlayHostType.Client },
      { text: mapPlayHostTypeJson(PlayHostType.Server), value: PlayHostType.Server },
    ]}
    onchange={onsethosttype}
  />
  <AppRadioGroup
    legend={I18nJsonAdapter.t('com_play_header_settings.label_difficulty')}
    modelValue={runtime.settings.difficulty}
    options={[
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Low), value: PlaySettingsDifficulty.Low },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Medium), value: PlaySettingsDifficulty.Medium },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.High), value: PlaySettingsDifficulty.High },
    ]}
    onchange={difficulty => void runtime.changeSettings({ difficulty })}
  />
  <AppRadioGroup
    legend={I18nJsonAdapter.t('com_play_header_settings.label_bonuses')}
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
