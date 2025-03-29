import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

export default {
  files: ['src/**/*.{js,ts}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    globals: {
      window: true,
      document: true,
      console: true,
      module: true,
      process: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescript,
    prettier: prettierPlugin,
  },
  rules: {
    // ✅ TypeScript rules
    ...typescript.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description',
        'ts-expect-error': 'allow-with-description',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // ✅ Prettier rules
    'prettier/prettier': 'error',

    // ✅ User rules
    'no-console': 'off',
    'linebreak-style': ['error', 'unix'],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'eol-last': ['error', 'always'],
    'no-unused-expressions': 'error',
    'no-duplicate-imports': 'error',
    semi: ['error', 'always'],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    eqeqeq: [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
  },
};
