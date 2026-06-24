<script lang="ts">
  import { DomainMatchDifficulty, DomainMatchType } from '@/app/enums/index.ts';
  import AppRadioGroup from '@/interface/components/app/AppRadioGroup.svelte';
  import { handleChangeMatchDifficulty, handleChangeMatchType } from '@/interface/handlers/setup.ts';
  import mainStore from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/locales/TextLocalizer.ts';

  const t = TextLocalizer.namespace('settings');
</script>

<form class="setup" aria-label="Match setup" onsubmit={event => event.preventDefault()}>
  <AppRadioGroup
    legend={t('difficulty')}
    modelValue={mainStore.matchDifficulty}
    options={[
      { text: t('difficulty_low'), value: DomainMatchDifficulty.Low },
      { text: t('difficulty_medium'), value: DomainMatchDifficulty.Medium },
      { text: t('difficulty_high'), value: DomainMatchDifficulty.High },
    ]}
    onchange={handleChangeMatchDifficulty}
  />
  <AppRadioGroup
    legend={t('bonuses')}
    modelValue={mainStore.matchType}
    options={[
      { text: t('bonus_distribution_classic'), value: DomainMatchType.Classic },
      { text: t('bonus_distribution_random'), value: DomainMatchType.Random },
    ]}
    onchange={handleChangeMatchType}
  />
</form>

<style>
  .setup {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
  }
</style>
