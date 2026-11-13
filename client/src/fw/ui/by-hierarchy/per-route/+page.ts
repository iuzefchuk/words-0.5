import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { ROUTES } from '@/client/src/fw/definitions/ROUTES.ts';

export function load(): never {
  redirect(307, resolve(ROUTES.Play));
}
