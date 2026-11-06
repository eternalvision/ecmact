import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  publicDir: false,
  resolve: { tsconfigPaths: true },
  plugins: [dts({ entryRoot: 'src', include: ['src'], tsconfigPath: 'tsconfig.json' })],
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: { settings: { navigation: { disableMainFrameNavigation: true } } },
    },
    include: ['tests/**/*.test.ts'],
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
