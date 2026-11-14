<script lang="ts">
  import { PlayResult } from '@/client/src/domain/play.ts';
  import { Key } from '@/client/src/fw/definitions/Key.ts';
  import dialog from '@/client/src/fw/headless/runes/per-app/for-component/TheDialog.svelte.ts';
  import AppButton, { AppButtonAccent } from '@/client/src/fw/ui/by-design/AppButton.svelte';
  import { getPlayRuntimeContext } from '@/client/src/fw/ui/by-hierarchy/per-route/play/Play.svelte';
  import comPlayMenubarJson from '@/client/src/platform/by-port/usecases/l10n/bundle/comPlayMenubarJson.ts';
  import type { TheDialogResult } from '@/client/src/fw/headless/runes/per-app/for-component/TheDialog.svelte.ts';

  const runtime = getPlayRuntimeContext();

  const buttons = $derived([
    {
      accent: AppButtonAccent.Primary,
      action: (): void => {
        void handleSave();
      },
      isDisabled: !runtime.isActionableForUser || !runtime.currentTurnIsValid,
      keys: [Key.Enter],
      name: comPlayMenubarJson('action_play'),
    },
    {
      accent: AppButtonAccent.Secondary,
      action: (): void => {
        void handlePass();
      },
      isDisabled: !runtime.isActionableForUser,
      keys: [Key.P],
      name: comPlayMenubarJson('action_pass'),
    },
    {
      accent: AppButtonAccent.Secondary,
      action: (): void => {
        void handleResign();
      },
      isDisabled: !runtime.isActionableForUser,
      keys: [Key.R],
      name: comPlayMenubarJson('action_resign'),
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

  async function triggerFinishDialog(): Promise<TheDialogResult> {
    const result = runtime.result;
    const scoreDiff = runtime.userScore - runtime.opponentScore;
    if (result === PlayResult.Undecided) {
      throw new Error(`cannot render result text: result is ${PlayResult.Undecided}`);
    }
    return await dialog.trigger({
      body: comPlayMenubarJson(
        (
          {
            [PlayResult.Lose]: scoreDiff < 0 ? 'body_finish_lose_1' : 'body_finish_lose_2',
            [PlayResult.Tie]: 'body_finish_tie',
            [PlayResult.Win]: scoreDiff > 0 ? 'body_finish_win_1' : 'body_finish_win_2',
          } as const
        )[result],
        { points: Math.abs(scoreDiff) },
      ),
      title: comPlayMenubarJson('title_finish'),
    });
  }

  async function triggerPassDialog(): Promise<TheDialogResult> {
    return await dialog.trigger({
      body: comPlayMenubarJson('body_pass'),
      title: comPlayMenubarJson('title_pass'),
    });
  }

  async function triggerResignDialog(): Promise<TheDialogResult> {
    return await dialog.trigger({
      body: comPlayMenubarJson('body_resign'),
      isDestructive: true,
      title: comPlayMenubarJson('title_resign'),
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
