import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isEmptyDirectory, mergeJson, scaffold, toPackageName } from '@create/scaffold';

const templateRoot = fileURLToPath(new URL('../template', import.meta.url));

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'create-ecmact-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

const generate = (tailwind: boolean, name = 'my-app') =>
  scaffold({
    templateRoot,
    target: join(directory, name),
    name,
    tailwind,
    ecmactVersion: '2.3.0',
  });

const read = (path: string) => readFile(join(directory, 'my-app', path), 'utf8');

describe('mergeJson', () => {
  it('merges nested objects and lets the overlay win', () => {
    expect(mergeJson({ a: { x: 1, y: 2 }, b: 1 }, { a: { y: 3, z: 4 }, c: 5 })).toEqual({
      a: { x: 1, y: 3, z: 4 },
      b: 1,
      c: 5,
    });
  });

  it('replaces arrays and primitives instead of merging them', () => {
    expect(mergeJson({ list: [1, 2], value: { a: 1 } }, { list: [3], value: 'text' })).toEqual({
      list: [3],
      value: 'text',
    });
  });

  it('does not change its inputs', () => {
    const base = { a: { x: 1 } };
    mergeJson(base, { a: { y: 2 } });
    expect(base).toEqual({ a: { x: 1 } });
  });
});

describe('toPackageName', () => {
  it('lowercases and replaces spaces', () => {
    expect(toPackageName('My Cool App')).toBe('my-cool-app');
  });

  it('removes characters that npm does not allow', () => {
    expect(toPackageName('app!@#name')).toBe('app-name');
  });

  it('trims leading dots, underscores and dashes and trailing dashes', () => {
    expect(toPackageName('._-app--')).toBe('app');
  });

  it('keeps valid characters', () => {
    expect(toPackageName('my-app_2.0~x')).toBe('my-app_2.0~x');
  });

  it('falls back to a default name', () => {
    expect(toPackageName('')).toBe('ecmact-app');
    expect(toPackageName('!!!')).toBe('ecmact-app');
  });
});

describe('isEmptyDirectory', () => {
  it('is true for a directory that does not exist', async () => {
    expect(await isEmptyDirectory(join(directory, 'missing'))).toBe(true);
  });

  it('is true for an empty directory', async () => {
    expect(await isEmptyDirectory(directory)).toBe(true);
  });

  it('is false when there are files', async () => {
    await writeFile(join(directory, 'file.txt'), '');
    expect(await isEmptyDirectory(directory)).toBe(false);
  });
});

describe('scaffold', () => {
  it('writes the base template and returns the sorted file list', async () => {
    const files = await generate(false);
    expect(files).toEqual([
      '.gitignore',
      'README.md',
      'index.html',
      'package.json',
      'src/counter.test.ts',
      'src/counter.ts',
      'src/main.ts',
      'tsconfig.json',
      'vite.config.ts',
    ]);
  });

  it('renames _gitignore to .gitignore', async () => {
    await generate(false);
    const names = await readdir(join(directory, 'my-app'));
    expect(names).toContain('.gitignore');
    expect(names).not.toContain('_gitignore');
  });

  it('fills in the project name and the ecmact version', async () => {
    await generate(false);
    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.name).toBe('my-app');
    expect(pkg.dependencies.ecmact).toBe('^2.3.0');
    expect(await read('index.html')).toContain('<title>my-app</title>');
    expect(await read('README.md')).toContain('# my-app');
  });

  it('leaves no placeholders behind', async () => {
    await generate(true);
    for (const file of ['package.json', 'index.html', 'README.md', 'src/main.ts']) {
      expect(await read(file)).not.toContain('{{');
    }
  });

  it('does not include tailwind by default', async () => {
    await generate(false);
    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.devDependencies.tailwindcss).toBeUndefined();
    expect(await read('src/main.ts')).not.toContain('tailwind');
  });

  it('adds tailwind on top of the base template', async () => {
    const files = await generate(true);
    expect(files).toContain('src/tailwind.css');
    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.devDependencies.tailwindcss).toBeDefined();
    expect(pkg.devDependencies['@tailwindcss/vite']).toBeDefined();
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.scripts.dev).toBe('vite');
    expect(pkg.name).toBe('my-app');
    expect(await read('vite.config.ts')).toContain('tailwindcss()');
    expect(await read('src/main.ts')).toContain("from './tailwind.css?inline'");
    expect(await read('src/counter.ts')).toContain('class:');
  });

  it('writes the same files with and without tailwind apart from the additions', async () => {
    const plain = await generate(false, 'plain');
    const styled = await generate(true, 'styled');
    expect(styled.filter((file) => !plain.includes(file))).toEqual(['src/tailwind.css']);
  });

  it('writes into a directory that already exists', async () => {
    await mkdir(join(directory, 'my-app'));
    await expect(generate(false)).resolves.toContain('package.json');
  });
});
