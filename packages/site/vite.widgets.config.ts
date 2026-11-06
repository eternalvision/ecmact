import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const library = fileURLToPath(new URL('../../src/index.ts', import.meta.url));

export default defineConfig({
  base: process.env.SITE_BASE ?? '/ecmact/',
  publicDir: false,
  resolve: {
    tsconfigPaths: true,
    alias: [{ find: /^ecmact$/, replacement: library }],
  },
  build: {
    outDir: 'dist/embed',
    emptyOutDir: true,
    lib: {
      entry: 'src/widgets/bundle.ts',
      formats: ['iife'],
      name: 'EcmactWidgets',
      fileName: () => 'ecmact-widgets.js',
    },
  },
});
