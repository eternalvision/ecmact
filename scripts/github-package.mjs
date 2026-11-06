import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const owner = '@eternalvision';
const registry = 'https://npm.pkg.github.com';

/**
 * Rewrites a package manifest so that it can be published to GitHub Packages, which only accepts
 * packages scoped to the repository owner.
 *
 * @param {string} directory - The directory that holds the package.json to rewrite.
 */
const rewrite = (directory) => {
  const file = join(directory, 'package.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  manifest.name = `${owner}/${manifest.name.replace(/^@[^/]+\//, '')}`;
  manifest.publishConfig = { access: 'public', registry };
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${file} is now ${manifest.name}`);
};

rewrite(process.argv[2] ?? '.');
