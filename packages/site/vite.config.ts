import { fileURLToPath } from 'node:url';
import { build, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const library = fileURLToPath(new URL('../../src/index.ts', import.meta.url));
const widgetsConfig = fileURLToPath(new URL('./vite.widgets.config.ts', import.meta.url));

/**
 * Keeps the widgets bundle that the host pages in `public/hosts` load, `embed/ecmact-widgets.js`, in step with the
 * site: every production build also builds it, so a plain `vite build` cannot ship a site without it, and the dev
 * server answers that address with a script that loads the widgets from source, so the gallery works while developing.
 *
 * @returns The plugin.
 */
const widgetsBundle = (): Plugin => {
  let production = false;
  return {
    name: 'ecmact-widgets-bundle',
    configResolved: (config) => {
      production = config.command === 'build';
    },
    configureServer: (server) => {
      const base = server.config.base;
      server.middlewares.use(`${base}embed/ecmact-widgets.js`, (_request, response) => {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(`import('${base}src/widgets/bundle.ts');`);
      });
    },
    closeBundle: async () => {
      if (production) await build({ configFile: widgetsConfig, logLevel: 'warn' });
    },
  };
};

export default defineConfig({
  plugins: [widgetsBundle()],
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
