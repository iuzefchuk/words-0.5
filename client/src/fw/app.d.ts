import type { RouteError } from '@/client/src/fw/definitions/RouteError.ts';

declare global {
  namespace App {
    interface Error {
      code: RouteError;
    }
  }
}

export {};
