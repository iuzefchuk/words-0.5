import type { Pathname } from '$app/types';

export const ROUTES = { Index: '/', Play: '/play' } as const satisfies Record<string, Pathname>;
