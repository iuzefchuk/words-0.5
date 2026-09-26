import prettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import tseslint from 'typescript-eslint';
import type { Linter } from 'eslint';

const ROOT = import.meta.dirname;

export default defineConfig(
  includeIgnoreFile(`${ROOT}/.gitignore`),
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  ...svelte.configs.recommended,
  perfectionist.configs['recommended-alphabetical'],
  {
    languageOptions: {
      parserOptions: { extraFileExtensions: ['.svelte'], projectService: true, tsconfigRootDir: ROOT },
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { format: ['strictCamelCase', 'UPPER_CASE'], selector: 'variableLike' },
        { filter: { match: true, regex: '^_' }, format: null, modifiers: ['unused'], selector: 'parameter' },
        { format: ['strictCamelCase', 'UPPER_CASE'], modifiers: ['const', 'global'], selector: 'variable' },
        { format: ['UPPER_CASE'], modifiers: ['static', 'readonly'], selector: 'classProperty' },
        { format: ['StrictPascalCase'], selector: 'typeLike' },
        { format: ['StrictPascalCase'], selector: 'enumMember' },
      ],
      '@typescript-eslint/no-extraneous-class': ['error', { allowStaticOnly: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: false,
          allowNullableNumber: false,
          allowNullableObject: false,
          allowNullableString: false,
          allowNumber: false,
          allowString: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      eqeqeq: ['error', 'always'],
      'id-length': ['error', { exceptions: ['_', 't'], min: 2, properties: 'never' }],
      'lines-between-class-members': ['error', 'always'],
      'max-depth': ['error', 4],
      'max-params': ['error', 7],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-param-reassign': 'error',
      'no-var': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type', 'unknown'],
          internalPattern: ['^@/.+'],
          newlinesBetween: 0,
        },
      ],
      'prefer-const': 'error',
      'svelte/no-at-html-tags': 'off',
      'svelte/prefer-svelte-reactivity': 'off',
    },
  },
  { files: ['**/*.svelte', '**/*.svelte.ts'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    files: ['src/**/*.svelte'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  restrictImports(['src/**'], ['src/svelte/stores/AppStore.svelte.ts', 'src/services/**'], {
    'client must not import from engine or server': ['@/engine/**', '@/server/**'],
  }),
  restrictImports(['src/services/**'], [], {
    'client must not import from engine or server': ['@/engine/**', '@/server/**'],
    'services must not import from domain or svelte': ['@/client/domain/**', '@/client/svelte/**'],
  }),
  restrictImports(['src/svelte/stores/AppStore.svelte.ts'], [], { 'client must not import from server': ['@/server/**'] }),
  prettier,
  ...svelte.configs.prettier,
);

function restrictImports(files: Array<string>, ignores: Array<string>, patterns: Record<string, Array<string>>): Linter.Config {
  return {
    files,
    ignores,
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: Object.entries(patterns).map(([message, group]) => ({ group, message })) },
      ],
    },
  };
}
