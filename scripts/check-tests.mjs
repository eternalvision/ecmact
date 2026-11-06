import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = (dir, suffix) =>
  walk(join(root, dir))
    .filter((file) => file.endsWith(suffix))
    .map((file) => relative(join(root, dir), file));

const expected = new Set(files('src', '.ts').map((file) => file.replace(/\.ts$/, '.test.ts')));
const actual = new Set(files('tests', '.test.ts'));

const missing = [...expected].filter((file) => !actual.has(file));
const orphaned = [...actual].filter((file) => !expected.has(file));

if (missing.length > 0 || orphaned.length > 0) {
  missing.forEach((file) => console.error(`missing test: tests/${file}`));
  orphaned.forEach((file) => console.error(`test without a source file: tests/${file}`));
  process.exit(1);
}

console.log(`tests mirror src: ${expected.size} files`);
