import dialogStore from '@/interface/runes/dialog.svelte.ts';
import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';
import TextLocalizer from '@/interface/services/TextLocalizer/TextLocalizer.ts';
import type { DialogResult } from '@/interface/runes/dialog.svelte.ts';

const RESIGN_DELAY_MS = 500;

export async function handlePass(): Promise<void> {
  if (mainStore.userPassWillBeResign) return handleResign();
  const { isConfirmed } = await triggerPassDialog();
  if (!isConfirmed) return;
  mainStore.pass();
}

export async function handleResign(): Promise<void> {
  const { isConfirmed } = await triggerResignDialog();
  if (!isConfirmed) return;
  setTimeout(() => {
    mainStore.resign();
  }, RESIGN_DELAY_MS);
}

export function handleSave(): void {
  mainStore.save();
  userStore.initialize();
}

async function triggerPassDialog(): Promise<DialogResult> {
  return await dialogStore.trigger({
    html: TextLocalizer.text('dialog.html_pass'),
    title: TextLocalizer.text('dialog.title_pass'),
  });
}

async function triggerResignDialog(): Promise<DialogResult> {
  return await dialogStore.trigger({
    html: TextLocalizer.text('dialog.html_resign'),
    isDestructive: true,
    title: TextLocalizer.text('dialog.title_resign'),
  });
}
