import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  resolve: { tsconfigPaths: true },
  define: { __ECMACT_VERSION__: JSON.stringify(root.version) },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
  build: {
    target: 'node20',
    minify: false,
    sourcemap: false,
    ssr: 'src/index.ts',
    rolldownOptions: { output: { entryFileNames: 'index.js' } },
  },
});
