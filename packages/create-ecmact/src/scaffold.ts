import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** What `scaffold` needs to write a project. */
export interface ScaffoldOptions {
  /** The directory that holds the `base` and `tailwind` template folders. */
  templateRoot: string;
  /** The directory to write into. */
  target: string;
  /** The package name of the new project. */
  name: string;
  /** Whether to layer Tailwind CSS on top of the base template. */
  tailwind: boolean;
  /** The version of `ecmact` the project depends on. */
  ecmactVersion: string;
}

/** A JSON object. */
type Json = Record<string, unknown>;

/**
 * Tells whether a value is a plain JSON object, not an array or `null`.
 *
 * @param value - The value to check.
 * @returns `true` for objects.
 */
const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Merges two JSON objects deeply. Values of the overlay win; arrays and primitives are replaced, not merged.
 * The inputs are not changed.
 *
 * @param base - The object to start from.
 * @param overlay - The object whose values win.
 * @returns A new merged object.
 */
export const mergeJson = (base: Json, overlay: Json): Json => {
  const merged: Json = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const current = merged[key];
    merged[key] = isObject(current) && isObject(value) ? mergeJson(current, value) : value;
  }
  return merged;
};

/**
 * Turns a directory name into a valid npm package name.
 *
 * @param name - The directory name.
 * @returns The name in lowercase, with invalid characters replaced; `ecmact-app` if nothing is left.
 */
export const toPackageName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-~._]+/g, '-')
    .replace(/^[._-]+|-+$/g, '') || 'ecmact-app';

/**
 * Tells whether a directory has no entries. A directory that does not exist counts as empty.
 *
 * @param path - The directory.
 * @returns `true` if it is empty or missing.
 */
export const isEmptyDirectory = async (path: string) => {
  try {
    return (await readdir(path)).length === 0;
  } catch {
    return true;
  }
};

/**
 * Lists all files below a directory, recursively.
 *
 * @param directory - The directory to walk.
 * @returns The paths of the files.
 */
const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
};

/**
 * Writes a new project from the template: copies the base files, layers Tailwind on top if asked,
 * renames `_gitignore` and fills in the project name and the `ecmact` version.
 *
 * @param options - The template location, the target directory and the choices.
 * @returns The files that were written, relative to the target and sorted.
 */
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
      /**
       * Skips the overlay's `package.json`, which is merged into the base one instead of copied.
       *
       * @param source - The path being copied.
       * @returns `false` for `package.json`.
       */
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
