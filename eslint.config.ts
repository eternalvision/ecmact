import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/dist', '**/coverage', 'packages/*/template']),
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  prettier,
  {
    files: ['src/**/*.ts', 'packages/*/src/**/*.ts'],
    extends: [jsdoc.configs['flat/recommended-typescript-error']],
    rules: {
      'jsdoc/tag-lines': ['error', 'never', { startLines: 1, tags: { example: { lines: 'any' } } }],
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/check-param-names': ['error', { checkDestructured: false }],
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
          contexts: [
            'Property > ArrowFunctionExpression',
            'Property > FunctionExpression',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSInterfaceBody > TSPropertySignature',
            'TSInterfaceBody > TSMethodSignature',
          ],
        },
      ],
    },
  },
  {
    files: ['packages/site/src/demos/**/*.ts', 'packages/site/src/widgets/**/*.ts'],
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSInterfaceBody > TSPropertySignature',
            'TSInterfaceBody > TSMethodSignature',
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'packages/*/bin/*.mjs'],
    extends: [jsdoc.configs['flat/recommended-error']],
    rules: {
      'jsdoc/tag-lines': ['error', 'never', { startLines: 1, tags: { example: { lines: 'any' } } }],
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: { FunctionDeclaration: true, ArrowFunctionExpression: true },
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'packages/*/bin/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly' } },
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'packages/*/src/**/*.ts', 'packages/*/tests/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '.', '..'],
              message: 'Import through the @em, @create or @tests alias.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts', 'packages/*/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-invalid-void-type': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]);
