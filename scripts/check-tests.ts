/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { KnownFailure } from '@tests/knownFailures';

const repository = fileURLToPath(new URL('..', import.meta.url));

/** The folder of the browser-only tests, relative to `tests/` of the library (D24). */
const browserDir = 'browser';

/** The closed list of browser-only test files (B07): a new name needs a decision of the owner. */
const browserOnly = [
  'adopted-sheets.test.ts',
  'focus.test.ts',
  'forms.test.ts',
  'lifecycle.test.ts',
  'nesting.test.ts',
  'parse-warning.test.ts',
];

/**
 * Lists all files below a directory, recursively.
 *
 * @param dir - The directory to walk.
 * @returns The paths of the files.
 */
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

/**
 * Lists the files with a given suffix below a directory of a package, relative to that directory.
 * A missing directory counts as empty.
 *
 * @param root - The package root.
 * @param dir - The directory inside it, `src` or `tests`.
 * @param suffix - The file name suffix to keep.
 * @returns The matching paths.
 */
const files = (root: string, dir: string, suffix: string): string[] => {
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

/**
 * Prints a problem of the tree and marks the check as failed.
 *
 * @param message - The problem, with the path it concerns.
 */
const fail = (message: string): void => {
  console.error(message);
  failed = true;
};

/** Tests mirror src in every package; the browser-only folder of the library has no sources. */
let total = 0;
for (const root of roots) {
  const label = relative(repository, root) || '.';
  const expected = new Set(
    files(root, 'src', '.ts').map((file) => file.replace(/\.ts$/, '.test.ts')),
  );
  const actual = new Set(
    files(root, 'tests', '.test.ts').filter(
      (file) => root !== repository || !file.startsWith(`${browserDir}/`),
    ),
  );
  total += expected.size;

  for (const file of expected) {
    if (!actual.has(file)) fail(`missing test: ${join(label, 'tests', file)}`);
  }
  for (const file of actual) {
    if (!expected.has(file)) fail(`test without a source file: ${join(label, 'tests', file)}`);
  }
}

/** Every file in the browser-only folder is on the closed list (B07). */
const testsDir = join(repository, 'tests');
const browserFiles = files(repository, join('tests', browserDir), '');
for (const file of browserFiles) {
  if (!browserOnly.includes(file)) {
    fail(`browser-only test not on the closed list: ${join('tests', browserDir, file)}`);
  }
}

/** Every registry entry is used by exactly one test of its file, and every use has an entry (K03). */
const registryFile = join(testsDir, 'knownFailures.ts');
const { knownFailures } = (await import(pathToFileURL(registryFile).href)) as {
  knownFailures: KnownFailure[];
};
const uses = new Map<number, string[]>();
for (const file of files(repository, 'tests', '.ts')) {
  if (join(testsDir, file) === registryFile) continue;
  const source = readFileSync(join(testsDir, file), 'utf8');
  for (const match of source.matchAll(/\bknownFailure\(\s*(\d+)\s*\)/g)) {
    const issue = Number(match[1]);
    uses.set(issue, [...(uses.get(issue) ?? []), file]);
  }
}

const entries = new Map<number, KnownFailure>();
for (const entry of knownFailures) {
  if (entries.has(entry.issue)) {
    fail(`known failure #${entry.issue} is listed twice in tests/knownFailures.ts`);
    continue;
  }
  entries.set(entry.issue, entry);
  const found = uses.get(entry.issue) ?? [];
  if (found.length === 0) {
    fail(`known failure #${entry.issue} is not used by any test (tests/${entry.file})`);
  } else if (found.length > 1) {
    fail(`known failure #${entry.issue} is used by ${found.length} tests: ${found.join(', ')}`);
  } else if (found[0] !== entry.file) {
    fail(
      `known failure #${entry.issue} is listed for tests/${entry.file} but used in tests/${found[0]}`,
    );
  } else if (!readFileSync(join(testsDir, entry.file), 'utf8').includes(entry.test)) {
    fail(`known failure #${entry.issue}: no test "${entry.test}" in tests/${entry.file}`);
  }
}
for (const [issue, found] of uses) {
  if (!entries.has(issue)) {
    fail(
      `knownFailure(${issue}) has no entry in tests/knownFailures.ts: ${found.map((file) => `tests/${file}`).join(', ')}`,
    );
  }
}

if (failed) process.exit(1);

console.log(`tests mirror src: ${total} files in ${roots.length} packages`);
console.log(
  `browser-only tests: ${browserFiles.length} of ${browserOnly.length}, known failures: ${knownFailures.length}`,
);
