import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('..', import.meta.url));

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = (root, dir, suffix) => {
  const base = join(root, dir);
  return existsSync(base)
    ? walk(base)
        .filter((file) => file.endsWith(suffix))
        .map((file) => relative(base, file))
    : [];
};

const packagesDir = join(repository, 'packages');
const roots = [
  repository,
  ...(existsSync(packagesDir)
    ? readdirSync(packagesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(packagesDir, entry.name))
    : []),
];

let failed = false;
let total = 0;

for (const root of roots) {
  const label = relative(repository, root) || '.';
  const expected = new Set(
    files(root, 'src', '.ts').map((file) => file.replace(/\.ts$/, '.test.ts')),
  );
  const actual = new Set(files(root, 'tests', '.test.ts'));
  total += expected.size;

  for (const file of expected) {
    if (!actual.has(file)) {
      console.error(`missing test: ${join(label, 'tests', file)}`);
      failed = true;
    }
  }
  for (const file of actual) {
    if (!expected.has(file)) {
      console.error(`test without a source file: ${join(label, 'tests', file)}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);

console.log(`tests mirror src: ${total} files in ${roots.length} packages`);
