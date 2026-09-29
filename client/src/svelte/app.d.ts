import type { ErrorCode } from '@/client/enums.ts';

declare global {
  namespace App {
    interface Error {
      code: ErrorCode;
    }
  }
}

export {};
