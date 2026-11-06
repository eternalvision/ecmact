import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const library = fileURLToPath(new URL('../../src/index.ts', import.meta.url));

export default defineConfig({
  base: process.env.SITE_BASE ?? '/ecmact/',
  resolve: {
    tsconfigPaths: true,
    alias: [{ find: /^ecmact$/, replacement: library }],
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
  build: { sourcemap: false, rolldownOptions: { output: { comments: { jsdoc: false } } } },
});
