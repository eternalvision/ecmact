import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/widget',
    lib: {
      entry: 'src/widget.ts',
      formats: ['iife'],
      name: 'PriceWidget',
      fileName: () => 'price-widget.js',
    },
  },
});
