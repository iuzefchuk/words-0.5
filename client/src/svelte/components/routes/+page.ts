import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { ROUTES } from '@/client/constants.ts';

export function load(): never {
  redirect(307, resolve(ROUTES.Play));
}
