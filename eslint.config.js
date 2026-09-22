import prettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ROOT = process.cwd();

const FILE_GLOB = {
  app: 'src/app/**',
  domain: 'src/domain/**',
  infrastructure: 'src/infrastructure/**',
  interface: 'src/interface/**',
};

const IMPORT_GLOB = {
  app: '@/app/**',
  domain: '@/domain/**',
  domainEntities: '@/domain/entities/**',
  domainEvents: '@/domain/events/**',
  domainPolicies: '@/domain/policies/**',
  domainServices: '@/domain/services/**',
  infrastructure: '@/infrastructure/**',
  interface: '@/interface/**',
};

export default defineConfig(
  includeIgnoreFile(`${ROOT}/.gitignore`),
  { ignores: ['.svelte-kit/'] },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  ...svelte.configs.recommended,
  perfectionist.configs['recommended-alphabetical'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        projectService: {
          allowDefaultProject: ['eslint.config.js', 'stylelint.config.js'],
        },
        tsconfigRootDir: ROOT,
      },
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
        {
          format: ['strictCamelCase', 'UPPER_CASE'],
          selector: 'variableLike',
        },
        {
          filter: { match: true, regex: '^_' },
          format: null,
          modifiers: ['unused'],
          selector: 'parameter',
        },
        {
          format: ['strictCamelCase', 'UPPER_CASE'],
          modifiers: ['const', 'global'],
          selector: 'variable',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['static', 'readonly'],
          selector: 'classProperty',
        },
        {
          format: ['StrictPascalCase'],
          selector: 'typeLike',
        },
        {
          format: ['StrictPascalCase'],
          selector: 'enumMember',
        },
      ],
      '@typescript-eslint/no-extraneous-class': ['error', { allowStaticOnly: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      // Permits the `this: void` annotation that unbound-method itself recommends for static helpers.
      '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
      // `void someVersionCounter;` is how the runes layer subscribes a reader to a $state
      // dependency; the autofix would strip `void` and leave a bare expression statement.
      '@typescript-eslint/no-meaningless-void-operator': 'off',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      // Numbers are interpolated into CSS calc() strings in style: directives; strictTypeChecked
      // otherwise forces String() around every grid coordinate.
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
      // `properties: never` because Svelte's own transition API takes `x`/`y` option keys, and `t` is the
      // conventional TextLocalizer.namespace() binding — neither is a name this codebase gets to choose.
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
      // Localized/game strings rendered via {@html} are trusted (mirrors the source's no-v-html: off).
      'svelte/no-at-html-tags': 'off',
      // Reactivity is managed explicitly via version counters; the tile cache / flood-fill collections
      // are intentionally plain (non-reactive) Map/Set.
      'svelte/prefer-svelte-reactivity': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: [FILE_GLOB.domain],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [IMPORT_GLOB.app, IMPORT_GLOB.infrastructure, IMPORT_GLOB.interface],
              message: 'domain must not import from app, infrastructure, or interface',
            },
          ],
        },
      ],
    },
  },
  {
    files: [FILE_GLOB.app],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [IMPORT_GLOB.infrastructure, IMPORT_GLOB.interface],
              message: 'app must not import from infrastructure or interface',
            },
            {
              group: [
                IMPORT_GLOB.domainEntities,
                IMPORT_GLOB.domainServices,
                IMPORT_GLOB.domainEvents,
                IMPORT_GLOB.domainPolicies,
              ],
              message: 'app must not import from certain domain directories',
            },
          ],
        },
      ],
    },
  },
  {
    files: [FILE_GLOB.infrastructure],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [IMPORT_GLOB.domain, IMPORT_GLOB.interface],
              message: 'infrastructure must not import from domain or interface',
            },
          ],
        },
      ],
    },
  },
  {
    files: [FILE_GLOB.interface],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [IMPORT_GLOB.domain, IMPORT_GLOB.infrastructure],
              message: 'interface must not import from domain or infrastructure',
            },
          ],
        },
      ],
    },
  },
  prettier,
  ...svelte.configs.prettier,
);
