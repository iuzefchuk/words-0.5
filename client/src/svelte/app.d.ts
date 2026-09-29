import type { ErrorCode } from '@/client/domain/error/enums.ts';

declare global {
  namespace App {
    interface Error {
      code: ErrorCode;
    }
  }
}

export {};
