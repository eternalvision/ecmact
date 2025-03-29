import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [
    dts({
      outDir: './dist/types',
      entryRoot: './src',
      beforeWriteFile: (filePath, content) => {
        const currentPath = path.dirname(filePath);

        const isRootFile = currentPath.endsWith('dist/types');
        let modifiedContent = content;

        if (isRootFile) {
          modifiedContent = content.replace(/(\.\.\/)+src\//g, './');
        } else {
          const typingsPath = path.resolve(__dirname, 'dist/types/typings');
          const relativePath = path.relative(currentPath, typingsPath);
          const depth = relativePath.split(path.sep).length;
          modifiedContent = content.replace(/(\.\.\/)+src\//g, (match) => {
            return '../'.repeat(depth - 1);
          });
          modifiedContent = modifiedContent.replace(/(\.\.\/)+types\//g, '../typings/');
        }
        return { filePath, content: modifiedContent };
      },
    }),
  ],
  define: {
    global: 'window',
  },
  cacheDir: 'node_modules/.vite',
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'ecmact',
      formats: ['es', 'cjs'],
      fileName: (format) => `${format}/index.js`,
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  esbuild: {
    target: 'esnext',
    legalComments: 'none',
  },
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
});
