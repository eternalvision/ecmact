import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build } from 'vite';

const repository = fileURLToPath(new URL('..', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'ecmact-size-'));

const hello = join(work, 'hello.ts');
writeFileSync(
  hello,
  `import { defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'hello-counter',
  ({ props }) => {
    const count = signal(0);
    return tags.button({ onclick: () => count.value++ }, () => \`\${props.label}: \${count.value}\`);
  },
  { attributes: { label: 'Clicks' }, css: 'button { font: inherit; }' },
);
`,
);

const everything = join(work, 'all.ts');
writeFileSync(
  everything,
  `import * as ecmact from 'ecmact';

Object.assign(globalThis, { ecmact });
`,
);

const entries = [
  ['a counter widget', hello],
  ['the widget of the starter template', 'packages/create-ecmact/template/widget/src/widget.ts'],
  ['the five widgets of the site gallery', 'packages/site/src/widgets/bundle.ts'],
  ['the whole library', everything],
];

/**
 * Formats a size in kilobytes.
 *
 * @param {number} bytes - The size in bytes.
 * @returns {string} The size with one decimal.
 */
const kilobytes = (bytes) => (bytes / 1024).toFixed(1);

/**
 * Names the script that a build writes.
 *
 * @returns {string} The file name.
 */
const fileName = () => 'widget.js';

try {
  console.log(
    'Size of a script that a page loads, with ECMact inside, minified by Vite, kB\n\n| script | minified | gzip | brotli |\n| ------ | -------- | ---- | ------ |',
  );
  for (const [name, entry] of entries) {
    const outDir = join(work, 'out');
    await build({
      configFile: false,
      logLevel: 'error',
      root: repository,
      publicDir: false,
      resolve: {
        alias: [
          { find: /^ecmact$/, replacement: join(repository, 'src/index.ts') },
          { find: /^@em\/(.*)$/, replacement: join(repository, 'src/$1') },
          { find: /^@site\/(.*)$/, replacement: join(repository, 'packages/site/src/$1') },
        ],
      },
      build: {
        outDir,
        emptyOutDir: true,
        lib: { entry, formats: ['iife'], name: 'Widget', fileName },
      },
    });
    const code = readFileSync(join(outDir, 'widget.js'));
    console.log(
      `| ${name} | ${kilobytes(code.length)} | ${kilobytes(gzipSync(code).length)} | ${kilobytes(brotliCompressSync(code).length)} |`,
    );
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
