import mainStore from '@/interface/runes/main.svelte.ts';
import userStore from '@/interface/runes/user.svelte.ts';
import type { DomainMatchDifficulty, DomainMatchType } from '@/app/enums/index.ts';

export function handleChangeMatchDifficulty(matchDifficulty: DomainMatchDifficulty): void {
  mainStore.changeMatchDifficulty(matchDifficulty);
}

export function handleChangeMatchType(matchType: DomainMatchType): void {
  mainStore.changeMatchType(matchType);
  userStore.initialize();
}
