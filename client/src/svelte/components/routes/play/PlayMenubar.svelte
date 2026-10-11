<script lang="ts">
  import { PlayResult } from '@/client/domain/enums.ts';
  import { Key } from '@/client/enums.ts';
  import I18nLibrary from '@/client/libraries/I18nLibrary.ts';
  import { getPlayRuntimeContext } from '@/client/svelte/components/routes/play/Play.svelte';
  import AppButton, { AppButtonAccent } from '@/client/svelte/components/shared/AppButton.svelte';
  import dialog from '@/client/svelte/runes/Dialog.svelte.ts';
  import type { DialogResult } from '@/client/svelte/runes/Dialog.svelte.ts';

  const runtime = getPlayRuntimeContext();

  await I18nLibrary.loadNamespace('com_play_menubar');

  const buttons = $derived([
    {
      accent: AppButtonAccent.Primary,
      action: (): void => {
        void handleSave();
      },
      isDisabled: !runtime.isActionableForUser || !runtime.currentTurnIsValid,
      keys: [Key.Enter],
      name: I18nLibrary.t('com_play_menubar.action_play'),
    },
    {
      accent: AppButtonAccent.Secondary,
      action: (): void => {
        void handlePass();
      },
      isDisabled: !runtime.isActionableForUser,
      keys: [Key.P],
      name: I18nLibrary.t('com_play_menubar.action_pass'),
    },
    {
      accent: AppButtonAccent.Secondary,
      action: (): void => {
        void handleResign();
      },
      isDisabled: !runtime.isActionableForUser,
      keys: [Key.R],
      name: I18nLibrary.t('com_play_menubar.action_resign'),
    },
  ]);

  async function handlePass(): Promise<void> {
    if (runtime.userPassWillBeResign) return handleResign();
    const { isConfirmed } = await triggerPassDialog();
    if (!isConfirmed) return;
    await runtime.pass();
    await handleTurnEnd();
  }

  async function handleResign(): Promise<void> {
    const { isConfirmed } = await triggerResignDialog();
    if (!isConfirmed) return;
    await runtime.resign();
    await handleTurnEnd();
  }

  async function handleSave(): Promise<void> {
    await runtime.save();
    await handleTurnEnd();
  }

  async function handleTurnEnd(): Promise<void> {
    if (!runtime.isFinished) return;
    const { isConfirmed } = await triggerFinishDialog();
    if (!isConfirmed) return;
    await runtime.restart();
  }

  async function triggerFinishDialog(): Promise<DialogResult> {
    const result = runtime.result;
    const scoreDiff = runtime.userScore - runtime.opponentScore;
    if (result === PlayResult.Undecided) {
      throw new Error(`cannot render result text: result is ${PlayResult.Undecided}`);
    }
    return await dialog.trigger({
      body: I18nLibrary.t(
        (
          {
            [PlayResult.Lose]: scoreDiff < 0 ? 'com_play_menubar.body_finish_lose_1' : 'com_play_menubar.body_finish_lose_2',
            [PlayResult.Tie]: 'com_play_menubar.body_finish_tie',
            [PlayResult.Win]: scoreDiff > 0 ? 'com_play_menubar.body_finish_win_1' : 'com_play_menubar.body_finish_win_2',
          } as const
        )[result],
        { points: Math.abs(scoreDiff) },
      ),
      title: I18nLibrary.t('com_play_menubar.title_finish'),
    });
  }

  async function triggerPassDialog(): Promise<DialogResult> {
    return await dialog.trigger({
      body: I18nLibrary.t('com_play_menubar.body_pass'),
      title: I18nLibrary.t('com_play_menubar.title_pass'),
    });
  }

  async function triggerResignDialog(): Promise<DialogResult> {
    return await dialog.trigger({
      body: I18nLibrary.t('com_play_menubar.body_resign'),
      isDestructive: true,
      title: I18nLibrary.t('com_play_menubar.title_resign'),
    });
  }
</script>

<div class="menubar" role="menubar" tabindex="-1">
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
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    padding: var(--padding-primary);

    @media screen and (width <= 34rem) {
      flex-direction: row-reverse;
    }
  }
</style>
