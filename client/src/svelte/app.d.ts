import type { RouteError } from '@/client/enums.ts';

declare global {
  namespace App {
    interface Error {
      code: RouteError;
    }
  }
}

export {};
