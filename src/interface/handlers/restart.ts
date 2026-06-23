import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';

export function handleRestartGame(): void {
  mainStore.restartGame();
  userStore.initialize();
}
