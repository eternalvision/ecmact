import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import dts from 'vite-plugin-dts';

export default defineConfig({
  publicDir: false,
  resolve: { tsconfigPaths: true },
  plugins: [dts({ entryRoot: 'src', include: ['src'], tsconfigPath: 'tsconfig.json' })],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          environmentOptions: {
            happyDOM: { settings: { navigation: { disableMainFrameNavigation: true } } },
          },
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/browser/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['tests/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              { browser: 'chromium', name: 'chromium', provide: { engine: 'chromium' } },
              { browser: 'firefox', name: 'firefox', provide: { engine: 'firefox' } },
              { browser: 'webkit', name: 'webkit', provide: { engine: 'webkit' } },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**'],
      reporter: ['text', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
  build: {
    sourcemap: true,
    minify: false,
    rolldownOptions: { output: { comments: { jsdoc: false } } },
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
  },
});
