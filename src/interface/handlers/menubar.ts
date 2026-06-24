import dialog from '@/interface/runes/dialog.svelte.ts';
import main from '@/interface/runes/main.svelte.ts';
import user from '@/interface/runes/user.svelte.ts';
import TextLocalizer from '@/interface/services/locales/TextLocalizer.ts';
import type { DialogResult } from '@/interface/runes/dialog.svelte.ts';
import { DomainMatchResult } from '@/app/enums/index.ts';

const RESIGN_DELAY_MS = 500;

export async function handlePass(): Promise<void> {
  if (main.userPassWillBeResign) return handleResign();
  const { isConfirmed } = await triggerPassDialog();
  if (!isConfirmed) return;
  await main.pass();
  await handleTurnEnd();
}

export async function handleResign(): Promise<void> {
  const { isConfirmed } = await triggerResignDialog();
  if (!isConfirmed) return;
  setTimeout(() => {
    main.resign();
    void handleTurnEnd();
  }, RESIGN_DELAY_MS);
}

export async function handleSave(): Promise<void> {
  const promise = main.save();
  user.initialize();
  await promise;
  await handleTurnEnd();
}

export async function handleTurnEnd(): Promise<void> {
  if (!main.matchIsFinished) return;
  const { isConfirmed } = await triggerFinishDialog()
  if (!isConfirmed) return;
  main.restartGame();
  user.initialize();
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

async function triggerFinishDialog(): Promise<DialogResult> {
  const {matchResult} = main;
  const scoreDiff = main.userScore - main.opponentScore;
  if (matchResult === DomainMatchResult.Undecided) {
    throw new Error(`cannot render match result text: result is ${DomainMatchResult.Undecided}`);
  }
  return await dialog.trigger({
    title: TextLocalizer.text('dialog.title_finish'),
    html: TextLocalizer.text(
      {
        [DomainMatchResult.Lose]: scoreDiff < 0 ? 'dialog.html_finish_lose_1' : 'dialog.html_finish_lose_2',
        [DomainMatchResult.Tie]: 'dialog.html_finish_tie',
        [DomainMatchResult.Win]: scoreDiff > 0 ? 'dialog.html_finish_win_1' : 'dialog.html_finish_win_2',
      }[matchResult],
      { points: Math.abs(scoreDiff) },
    ),
  });
}