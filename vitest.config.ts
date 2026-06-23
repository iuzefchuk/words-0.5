import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
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
