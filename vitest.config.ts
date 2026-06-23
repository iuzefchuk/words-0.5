import { defineConfig } from 'vitest/config';
import { DIRECTORY } from './meta/constants.ts';

export default defineConfig({
  resolve: {
    alias: { $: DIRECTORY.tests, '@': DIRECTORY.src },
  },
  test: {
    clearMocks: true,
    environment: 'happy-dom',
    globals: false,
    include: ['tests/**/*.test.ts'],
    mockReset: true,
    passWithNoTests: true,
    restoreMocks: true,
  },
});
