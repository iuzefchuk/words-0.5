<script lang="ts">
  import AppButton from '@/interface/components/app/AppButton.svelte';
  import { Accent, Key, TransitionDuration } from '@/interface/enums.ts';
  import { handlePass, handleResign, handleSave } from '@/interface/handlers/menubar.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import TextLocalizer from '@/interface/services/locales/TextLocalizer.ts';
  import { fly } from 'svelte/transition';

  const t = TextLocalizer.namespace('game');

  const buttons = $derived([
    {
      accent: Accent.Primary,
      action: (): void => {
        void handleSave();
      },
      isDisabled: main.allActionsAreDisabled || !main.currentTurnIsValid,
      keys: [Key.Enter],
      name: t('action_play'),
    },
    {
      accent: Accent.Secondary,
      action: (): void => {
        void handlePass();
      },
      isDisabled: main.allActionsAreDisabled,
      keys: [Key.P],
      name: t('action_pass'),
    },
    {
      accent: Accent.Secondary,
      action: (): void => {
        void handleResign();
      },
      isDisabled: main.allActionsAreDisabled,
      keys: [Key.R],
      name: t('action_resign'),
    },
  ]);
</script>

<div
  transition:fly|global={{ duration: TransitionDuration.Normal, x: '1rem' }}
  class="menubar"
  role="menubar"
  aria-label="Match actions"
  tabindex="-1"
>
  {#each buttons as button (button.name)}
    <AppButton
      accent={button.accent}
      isDisabled={button.isDisabled}
      keys={button.keys}
      text={button.name}
      ontrigger={button.action}
    />
  {/each}
</div>

<style>
  .menubar {
    z-index: var(--z-index-level-1);
    display: flex;
    flex-direction: column;
    grid-column: 3;
    gap: var(--space-s);
    place-self: end end;
    padding: var(--padding-primary);

    @media screen and (width <= 34rem) {
      flex-direction: row-reverse;
      grid-column: 1;
      width: 100%;
    }
  }
</style>
