import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.svelte-kit/', 'playwright-report/', '.playwright/', 'meta/dictionary/'],
  },
  tseslint.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    rules: {
      // Localized/game strings rendered via {@html} are trusted (mirrors the source's no-v-html: off).
      'svelte/no-at-html-tags': 'off',
      // Reactivity is managed explicitly via version counters; the tile cache / flood-fill collections
      // are intentionally plain (non-reactive) Map/Set.
      'svelte/prefer-svelte-reactivity': 'off',
    },
  },
);
