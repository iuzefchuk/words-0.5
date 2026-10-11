import { RouteError } from '@/client/enums.ts';
import type { HandleClientError } from '@sveltejs/kit';

export function handleError({ error, message, status }: Parameters<HandleClientError>[0]): App.Error {
  console.error(error);
  if (status === 404) return { code: RouteError.NotFound, message };
  if (error instanceof Error && error.cause instanceof Response && error.cause.status >= 500) {
    return { code: RouteError.ServerUnavailable, message: error.message };
  }
  return { code: RouteError.Unexpected, message: error instanceof Error ? error.message : message };
}
