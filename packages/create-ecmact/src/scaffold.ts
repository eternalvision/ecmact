import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface ScaffoldOptions {
  templateRoot: string;
  target: string;
  name: string;
  tailwind: boolean;
  ecmactVersion: string;
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const mergeJson = (base: Json, overlay: Json): Json => {
  const merged: Json = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const current = merged[key];
    merged[key] = isObject(current) && isObject(value) ? mergeJson(current, value) : value;
  }
  return merged;
};

export const toPackageName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-~._]+/g, '-')
    .replace(/^[._-]+|-+$/g, '') || 'ecmact-app';

export const isEmptyDirectory = async (path: string) => {
  try {
    return (await readdir(path)).length === 0;
  } catch {
    return true;
  }
};

const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
};

export const scaffold = async ({
  templateRoot,
  target,
  name,
  tailwind,
  ecmactVersion,
}: ScaffoldOptions) => {
  await mkdir(target, { recursive: true });
  await cp(join(templateRoot, 'base'), target, { recursive: true });

  if (tailwind) {
    const overlay = join(templateRoot, 'tailwind');
    const overlayPackage = JSON.parse(
      await readFile(join(overlay, 'package.json'), 'utf8'),
    ) as Json;
    const basePackage = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as Json;
    await cp(overlay, target, {
      recursive: true,
      filter: (source) => !source.endsWith('package.json'),
    });
    await writeFile(
      join(target, 'package.json'),
      `${JSON.stringify(mergeJson(basePackage, overlayPackage), null, 2)}\n`,
    );
  }

  await rename(join(target, '_gitignore'), join(target, '.gitignore'));

  const files = await walk(target);
  await Promise.all(
    files.map(async (file) => {
      const text = await readFile(file, 'utf8');
      const filled = text
        .replaceAll('{{name}}', name)
        .replaceAll('{{ecmactVersion}}', ecmactVersion);
      if (filled !== text) await writeFile(file, filled);
    }),
  );

  return files.map((file) => file.slice(target.length + 1)).sort();
};
