import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { scaffold } from '@create/project/scaffold';

const templateRoot = fileURLToPath(new URL('../../template', import.meta.url));

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

describe('scaffold', () => {
  it('writes the base template and returns the sorted file list', async () => {
    const files = await generate(false);
    expect(files).toEqual([
      '.editorconfig',
      '.gitignore',
      '.prettierignore',
      '.prettierrc',
      '.vscode/extensions.json',
      '.vscode/settings.json',
      'README.md',
      'eslint.config.ts',
      'index.html',
      'package.json',
      'public/favicon.png',
      'src/app.ts',
      'src/assets/ecmact-logo.png',
      'src/components/counter.test.ts',
      'src/components/counter.ts',
      'src/components/logo.ts',
      'src/main.ts',
      'src/reset.css',
      'src/setup.ts',
      'src/styles.css',
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
    for (const file of ['package.json', 'index.html', 'README.md', 'src/setup.ts']) {
      expect(await read(file)).not.toContain('{{');
    }
  });

  it('does not include tailwind by default', async () => {
    await generate(false);
    const pkg = JSON.parse(await read('package.json'));
    expect(pkg.devDependencies.tailwindcss).toBeUndefined();
    expect(await read('src/setup.ts')).not.toContain('tailwind');
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
    expect(await read('src/setup.ts')).toContain("from './tailwind.css?inline'");
    expect(await read('src/components/counter.ts')).toContain('rounded-xl');
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

  it('leaves files that are not part of the template alone', async () => {
    const target = join(directory, 'my-app');
    await mkdir(join(target, 'node_modules', 'pkg'), { recursive: true });
    await writeFile(join(target, 'notes.txt'), 'keep {{name}}');
    await writeFile(join(target, 'node_modules', 'pkg', 'index.js'), 'keep {{name}}');
    const files = await generate(false);
    expect(await read('notes.txt')).toBe('keep {{name}}');
    expect(await read('node_modules/pkg/index.js')).toBe('keep {{name}}');
    expect(files).not.toContain('notes.txt');
    expect(files).not.toContain('node_modules/pkg/index.js');
  });

  it('overwrites a template file that already exists', async () => {
    const target = join(directory, 'my-app');
    await mkdir(target);
    await writeFile(join(target, 'index.html'), 'old');
    await generate(false);
    expect(await read('index.html')).toContain('<title>my-app</title>');
  });
});

describe('scaffold the widget template', () => {
  const widget = () =>
    scaffold({
      templateRoot,
      target: join(directory, 'my-app'),
      name: 'my-app',
      tailwind: false,
      template: 'widget',
      ecmactVersion: '2.3.0',
    });

  it('writes the widget files and drops the app files', async () => {
    const files = await widget();
    expect(files).toContain('src/widget.ts');
    expect(files).toContain('src/widget.test.ts');
    expect(files).toContain('vite.widget.config.ts');
    expect(files).toContain('index.html');
    [
      'src/app.ts',
      'src/setup.ts',
      'src/components/counter.ts',
      'src/assets/ecmact-logo.png',
    ].forEach((file) => expect(files).not.toContain(file));
    expect(files).not.toContain('_remove');
  });

  it('removes the app files from the disk', async () => {
    await widget();
    const names = await readdir(join(directory, 'my-app', 'src'));
    expect(names.sort()).toEqual(['main.ts', 'styles.css', 'widget.test.ts', 'widget.ts']);
  });

  it('merges the widget scripts into package.json', async () => {
    await widget();
    const manifest = JSON.parse(await read('package.json')) as {
      scripts: Record<string, string>;
    };
    expect(manifest.scripts['build:widget']).toContain('vite.widget.config.ts');
    expect(manifest.scripts.dev).toBe('vite');
  });

  it('fills in the project name and leaves no placeholders', async () => {
    const files = await widget();
    expect(await read('index.html')).toContain('<title>my-app</title>');
    for (const file of files.filter((name) => /\.(ts|json|html|md)$/.test(name))) {
      expect(await read(file)).not.toContain('{{');
    }
  });

  it('includes the widget config in the type check', async () => {
    await widget();
    expect(await read('tsconfig.json')).toContain('vite.widget.config.ts');
  });

  it('ignores the tailwind option', async () => {
    await scaffold({
      templateRoot,
      target: join(directory, 'my-app'),
      name: 'my-app',
      tailwind: true,
      template: 'widget',
      ecmactVersion: '2.3.0',
    });
    expect(await readdir(join(directory, 'my-app', 'src'))).not.toContain('tailwind.css');
  });
});
