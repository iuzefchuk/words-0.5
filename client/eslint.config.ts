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
    settings: { svelte: { kit: { files: { routes: 'src/fw/ui/by-hierarchy/per-route' } } } },
  },
  { files: ['**/*.svelte', '**/*.svelte.ts'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    files: ['design-system/**/*.svelte', 'src/**/*.svelte'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  { files: ['design-system/**/*.svelte'], rules: { 'svelte/no-navigation-without-resolve': 'off' } },
  {
    files: ['src/**/*.d.ts', 'src/platform/by-port/*/port.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
  {
    files: ['src/**'],
    ignores: [
      'src/domain/**',
      'src/fw/app.*',
      'src/fw/definitions/*',
      'src/fw/headless/actions/*',
      'src/fw/headless/hooks/*',
      'src/fw/headless/runes/per-app/for-component/*',
      'src/fw/headless/runes/per-app/for-endpoint/*',
      'src/fw/headless/runes/per-instance/*',
      'src/fw/ui/by-design/**/[A-Z]*',
      'src/fw/ui/by-hierarchy/*/**/[A-Z]*',
      'src/fw/ui/by-hierarchy/per-app/index.*',
      'src/fw/ui/by-hierarchy/per-route/**/+*',
      'src/platform/by-port/*/adapters/[a-z]*',
      'src/platform/by-port/*/port.ts',
      'src/platform/by-protocol/io/[a-z]*',
      'src/platform/by-protocol/usage/[a-z]*/**',
    ],
    rules: {
      'no-restricted-syntax': ['error', { message: 'file is outside the template source tree', selector: 'Program' }],
    },
  },
  {
    files: ['src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { message: 'src must import by alias, not by relative path', regex: '^\\.(?!/\\$types$)' },
            { message: 'src must not import from rest', regex: '^@/client/(?!(?:assets|src)/)' },
            { group: ['@/client/src/fw/headless/hooks/**'], message: 'src must not import from hooks' },
            { group: ['@/server/**'], message: 'client must not import from server' },
          ],
        },
      ],
    },
  },
  restrictImports(['src/domain/**'], {
    'domain must not import from framework': ['$app/**', '$env/**', '@sveltejs/**', 'svelte', 'svelte/**'],
    'domain must not import from fw': ['@/client/src/fw/**'],
    'domain must not import from platform': ['@/client/src/platform/**'],
  }),
  restrictImports(['src/platform/by-protocol/io/**'], {
    'io must not import from by-port': ['@/client/src/platform/by-port/**'],
    'io must not import from domain': ['@/client/src/domain/**'],
    'io must not import from framework': ['$app/**', '$env/**', '@sveltejs/**', 'svelte', 'svelte/**'],
    'io must not import from fw': ['@/client/src/fw/**'],
    'io must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'io must not import from usage': ['@/client/src/platform/by-protocol/usage/**'],
  }),
  restrictImports(['src/platform/by-protocol/usage/**'], {
    'usage must not import from by-port': ['@/client/src/platform/by-port/**'],
    'usage must not import from framework': ['$app/**', '$env/**', '@sveltejs/**', 'svelte', 'svelte/**'],
    'usage must not import from fw': ['@/client/src/fw/**'],
    'usage must not import from usage': ['@/client/src/platform/by-protocol/usage/**'],
  }),
  restrictImports(['src/platform/by-port/**'], {
    'by-port must not import from adapters': ['@/client/src/platform/by-port/*/adapters/**'],
    'by-port must not import from by-protocol': ['@/client/src/platform/by-protocol/**'],
    'by-port must not import from domain': ['@/client/src/domain/**'],
    'by-port must not import from framework': ['$app/**', '$env/**', '@sveltejs/**', 'svelte', 'svelte/**'],
    'by-port must not import from fw': ['@/client/src/fw/**'],
  }),
  restrictImports(['src/fw/definitions/**'], {
    'definitions must not import from actions': ['@/client/src/fw/headless/actions/**'],
    'definitions must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'definitions must not import from runes': ['@/client/src/fw/headless/runes/**'],
    'definitions must not import from ui': ['@/client/src/fw/ui/**'],
  }),
  restrictImports(['src/fw/headless/actions/**'], {
    'actions must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'actions must not import from runes': ['@/client/src/fw/headless/runes/**'],
    'actions must not import from ui': ['@/client/src/fw/ui/**'],
  }),
  restrictImports(['src/fw/headless/hooks/**'], {
    'hooks must not import from actions': ['@/client/src/fw/headless/actions/**'],
    'hooks must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'hooks must not import from runes': ['@/client/src/fw/headless/runes/**'],
    'hooks must not import from ui': ['@/client/src/fw/ui/**'],
  }),
  restrictImports(['src/fw/headless/runes/per-instance/**'], {
    'per-instance runes must not import from actions': ['@/client/src/fw/headless/actions/**'],
    'per-instance runes must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'per-instance runes must not import from per-app runes': ['@/client/src/fw/headless/runes/per-app/**'],
    'per-instance runes must not import from ui': ['@/client/src/fw/ui/**'],
  }),
  restrictImports(['src/fw/headless/runes/per-app/**'], {
    'per-app runes must not import from actions': ['@/client/src/fw/headless/actions/**'],
    'per-app runes must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'per-app runes must not import from per-app runes': ['@/client/src/fw/headless/runes/per-app/**'],
    'per-app runes must not import from ui': ['@/client/src/fw/ui/**'],
  }),
  restrictImports(['src/fw/ui/by-design/**'], {
    'by-design must not import from by-hierarchy': ['@/client/src/fw/ui/by-hierarchy/**'],
    'by-design must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'by-design must not import from per-app runes': ['@/client/src/fw/headless/runes/per-app/**'],
  }),
  restrictImports(['src/fw/ui/by-hierarchy/per-app/**'], {
    'per-app must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'per-app must not import from per-route': ['@/client/src/fw/ui/by-hierarchy/per-route/**'],
  }),
  restrictImports(['src/fw/ui/by-hierarchy/per-route/**'], {
    'per-route must not import from io': ['@/client/src/platform/by-protocol/io/**'],
    'per-route must not import from per-app except its index': [
      '@/client/src/fw/ui/by-hierarchy/per-app/**',
      '!@/client/src/fw/ui/by-hierarchy/per-app/index.svelte',
    ],
  }),
  prettier,
  ...svelte.configs.prettier,
);

function restrictImports(files: Array<string>, patterns: Record<string, Array<string>>): Linter.Config {
  return {
    files,
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: Object.entries(patterns).map(([message, group]) => ({ group, message })) },
      ],
    },
  };
}
