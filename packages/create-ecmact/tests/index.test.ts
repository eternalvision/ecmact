import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run, type Io } from '@create/index';

let cwd: string;

beforeEach(async () => {
  cwd = await mkdtemp(join(tmpdir(), 'create-ecmact-run-'));
});

afterEach(async () => {
  await rm(cwd, { recursive: true, force: true });
});

const execute = async (argv: string[], answers: string[] = [], env: Io['env'] = {}) => {
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  answers.forEach((answer) => stdin.write(`${answer}\n`));
  stdin.end();
  const code = await run(argv, { cwd, env, stdin, stdout, stderr });
  return {
    code,
    out: (stdout.read() ?? '').toString() as string,
    err: (stderr.read() ?? '').toString() as string,
  };
};

const read = (path: string) => readFile(join(cwd, path), 'utf8');

describe('run', () => {
  it('prints the help and exits', async () => {
    const { code, out } = await execute(['--help']);
    expect(code).toBe(0);
    expect(out).toContain('Usage: create-ecmact');
    expect(await readdir(cwd)).toEqual([]);
  });

  it('creates the default project with --yes', async () => {
    const { code, out } = await execute(['--yes']);
    expect(code).toBe(0);
    expect(await readdir(join(cwd, 'my-ecmact-app'))).toContain('package.json');
    expect(out).toContain('Created my-ecmact-app.');
    expect(out).toContain('cd my-ecmact-app');
    expect(out).toContain('npm install');
    expect(out).toContain('npm run dev');
  });

  it('uses the version of this repository for the ecmact dependency', async () => {
    await execute(['app', '--yes']);
    const root = JSON.parse(
      await readFile(new URL('../../../package.json', import.meta.url), 'utf8'),
    );
    expect(JSON.parse(await read('app/package.json')).dependencies.ecmact).toBe(`^${root.version}`);
  });

  it('uses the given directory and a clean package name', async () => {
    await execute(['My App', '--yes']);
    expect(JSON.parse(await read('My App/package.json')).name).toBe('my-app');
  });

  it('suggests the package manager that started it', async () => {
    const { out } = await execute(['app', '--yes'], [], {
      npm_config_user_agent: 'pnpm/9.0.0 npm/? node/v22.0.0',
    });
    expect(out).toContain('pnpm install');
    expect(out).toContain('pnpm dev');
    expect(out).not.toContain('pnpm run');
  });

  it('scaffolds into the current directory with "."', async () => {
    const { code, out } = await execute(['.', '--yes']);
    expect(code).toBe(0);
    expect(await readdir(cwd)).toContain('package.json');
    expect(out).not.toContain('cd ');
  });

  it('refuses a directory that is not empty', async () => {
    await mkdir(join(cwd, 'app'));
    await writeFile(join(cwd, 'app', 'keep.txt'), 'keep');
    const { code, err } = await execute(['app', '--yes']);
    expect(code).toBe(1);
    expect(err).toContain('Directory "app" is not empty');
    expect(await readdir(join(cwd, 'app'))).toEqual(['keep.txt']);
  });

  it('writes into a directory that is not empty with --force', async () => {
    await mkdir(join(cwd, 'app'));
    await writeFile(join(cwd, 'app', 'keep.txt'), 'keep');
    const { code } = await execute(['app', '--yes', '--force']);
    expect(code).toBe(0);
    expect(await readdir(join(cwd, 'app'))).toContain('keep.txt');
    expect(await readdir(join(cwd, 'app'))).toContain('package.json');
  });

  it('adds tailwind with --tailwind', async () => {
    const { out } = await execute(['app', '--tailwind']);
    expect(out).toContain('with Tailwind CSS');
    expect(await readdir(join(cwd, 'app', 'src'))).toContain('tailwind.css');
  });

  it('does not add tailwind with --no-tailwind', async () => {
    await execute(['app', '--no-tailwind']);
    expect(await readdir(join(cwd, 'app', 'src'))).not.toContain('tailwind.css');
  });

  it('asks for the name and for tailwind when run without arguments', async () => {
    const { out } = await execute([], ['asked-app', 'y']);
    expect(out).toContain('Project name (my-ecmact-app)');
    expect(out).toContain('Add Tailwind CSS? [y/N]');
    expect(await readdir(join(cwd, 'asked-app', 'src'))).toContain('tailwind.css');
  });

  it('uses the defaults when the questions are left empty', async () => {
    const { code } = await execute([], ['', '']);
    expect(code).toBe(0);
    expect(await readdir(join(cwd, 'my-ecmact-app', 'src'))).not.toContain('tailwind.css');
  });

  it('does not ask about tailwind when --yes is set', async () => {
    const { out } = await execute(['app', '--yes']);
    expect(out).not.toContain('Tailwind CSS?');
  });
});
