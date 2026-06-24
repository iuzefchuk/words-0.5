import main from '@/interface/runes/main.svelte.ts';
import user from '@/interface/runes/user.svelte.ts';
import type { DomainMatchDifficulty, DomainMatchType } from '@/app/enums/index.ts';

export function handleChangeMatchDifficulty(matchDifficulty: DomainMatchDifficulty): void {
  main.changeMatchDifficulty(matchDifficulty);
}

export function handleChangeMatchType(matchType: DomainMatchType): void {
  main.changeMatchType(matchType);
  user.initialize();
}
