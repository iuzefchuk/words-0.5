<script lang="ts">
  import { PlayEngineType, PlaySettingsDifficulty, PlaySettingsType } from '@/client/src/domain/play.ts';
  import AppRadioGroup from '@/client/src/fw/ui/by-design/AppRadioGroup.svelte';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import comPlayHeaderSettingsJson from '@/client/src/platform/by-port/usecases/l10n/bundle/comPlayHeaderSettingsJson.ts';
  import mapPlayEngineTypeJson from '@/client/src/platform/by-port/usecases/l10n/bundle/mapPlayEngineTypeJson.ts';
  import mapPlaySettingsDifficultyJson from '@/client/src/platform/by-port/usecases/l10n/bundle/mapPlaySettingsDifficultyJson.ts';
  import mapPlaySettingsTypeJson from '@/client/src/platform/by-port/usecases/l10n/bundle/mapPlaySettingsTypeJson.ts';

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
    legend={comPlayHeaderSettingsJson('label_engine_type')}
    modelValue={runtime.engineType}
    options={[
      { text: mapPlayEngineTypeJson(PlayEngineType.Client), value: PlayEngineType.Client },
      { text: mapPlayEngineTypeJson(PlayEngineType.Server), value: PlayEngineType.Server },
    ]}
    onchange={onsetenginetype}
  />
  <AppRadioGroup
    legend={comPlayHeaderSettingsJson('label_difficulty')}
    modelValue={runtime.settings.difficulty}
    options={[
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Low), value: PlaySettingsDifficulty.Low },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.Medium), value: PlaySettingsDifficulty.Medium },
      { text: mapPlaySettingsDifficultyJson(PlaySettingsDifficulty.High), value: PlaySettingsDifficulty.High },
    ]}
    onchange={difficulty => void runtime.changeSettings({ difficulty })}
  />
  <AppRadioGroup
    legend={comPlayHeaderSettingsJson('label_bonuses')}
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
