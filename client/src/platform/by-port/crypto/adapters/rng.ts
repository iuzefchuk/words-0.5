import type { CryptoPort } from '@/client/src/platform/by-port/crypto/port.ts';

export default {
  generateSeed(): number {
    const [seed] = crypto.getRandomValues(new Uint32Array(1));
    if (seed === undefined) throw new ReferenceError('expected random seed, got undefined');
    return seed;
  },
} satisfies CryptoPort;
