import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('..', import.meta.url));
const scaffolder = join(repository, 'packages/create-ecmact/bin/create-ecmact.mjs');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/**
 * Runs a command and shows its output.
 *
 * @param {string} command - The program to run.
 * @param {string[]} args - Its arguments.
 * @param {string} cwd - The directory to run it in.
 */
const run = (command, args, cwd) => {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
};

const work = mkdtempSync(join(tmpdir(), 'ecmact-template-'));

try {
  run(npm, ['pack', '--pack-destination', work, '--silent'], repository);
  const tarball = join(work, readdirSync(work).find((file) => file.endsWith('.tgz')) ?? '');

  for (const variant of ['plain', 'tailwind']) {
    const flag = variant === 'tailwind' ? '--tailwind' : '--no-tailwind';
    const project = join(work, variant);
    run(process.execPath, [scaffolder, project, flag, '--yes'], repository);
    run(npm, ['install', tarball, '--no-audit', '--no-fund'], project);
    run(npm, ['run', 'check'], project);
    run(npm, ['run', 'build'], project);
  }

  console.log('\nboth variants of the template pass lint, format, typecheck, tests and build');
} finally {
  rmSync(work, { recursive: true, force: true });
}
