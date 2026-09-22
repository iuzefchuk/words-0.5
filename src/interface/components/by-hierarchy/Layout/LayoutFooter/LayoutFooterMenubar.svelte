<script lang="ts">
  import { fly } from 'svelte/transition';
  import { DomainMatchResult } from '@/app/enums/index.ts';
  import AppButton from '@/interface/components/app/AppButton.svelte';
  import { Accent, Key, TransitionDuration } from '@/interface/enums.ts';
  import dialog from '@/interface/runes/dialog.svelte.ts';
  import main from '@/interface/runes/main.svelte.ts';
  import user from '@/interface/runes/user.svelte.ts';
  import TextLocalizer from '@/interface/services/TextLocalizer.ts';
  import type { DialogResult } from '@/interface/runes/dialog.svelte.ts';

  const RESIGN_DELAY_MS = 500;

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

  async function handlePass(): Promise<void> {
    if (main.userPassWillBeResign) return handleResign();
    const { isConfirmed } = await triggerPassDialog();
    if (!isConfirmed) return;
    await main.pass();
    await handleTurnEnd();
  }

  async function handleResign(): Promise<void> {
    const { isConfirmed } = await triggerResignDialog();
    if (!isConfirmed) return;
    setTimeout(() => {
      main.resign();
      void handleTurnEnd();
    }, RESIGN_DELAY_MS);
  }

  async function handleSave(): Promise<void> {
    const promise = main.save();
    user.initialize();
    await promise;
    await handleTurnEnd();
  }

  async function handleTurnEnd(): Promise<void> {
    if (!main.matchIsFinished) return;
    const { isConfirmed } = await triggerFinishDialog();
    if (!isConfirmed) return;
    main.restartGame();
    user.initialize();
  }

  async function triggerFinishDialog(): Promise<DialogResult> {
    const { matchResult } = main;
    const scoreDiff = main.userScore - main.opponentScore;
    if (matchResult === DomainMatchResult.Undecided) {
      throw new Error(`cannot render match result text: result is ${DomainMatchResult.Undecided}`);
    }
    return await dialog.trigger({
      html: TextLocalizer.text(
        {
          [DomainMatchResult.Lose]: scoreDiff < 0 ? 'dialog.html_finish_lose_1' : 'dialog.html_finish_lose_2',
          [DomainMatchResult.Tie]: 'dialog.html_finish_tie',
          [DomainMatchResult.Win]: scoreDiff > 0 ? 'dialog.html_finish_win_1' : 'dialog.html_finish_win_2',
        }[matchResult],
        { points: Math.abs(scoreDiff) },
      ),
      title: TextLocalizer.text('dialog.title_finish'),
    });
  }

  async function triggerPassDialog(): Promise<DialogResult> {
    return await dialog.trigger({
      html: TextLocalizer.text('dialog.html_pass'),
      title: TextLocalizer.text('dialog.title_pass'),
    });
  }

  async function triggerResignDialog(): Promise<DialogResult> {
    return await dialog.trigger({
      html: TextLocalizer.text('dialog.html_resign'),
      isDestructive: true,
      title: TextLocalizer.text('dialog.title_resign'),
    });
  }
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
