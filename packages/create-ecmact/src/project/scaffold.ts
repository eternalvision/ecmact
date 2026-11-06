import { cp, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { readRemoved, removeFiles, walk } from '@create/project/files';
import { mergeJson, type Json } from '@create/project/json';

/** The kinds of project the scaffolder can write. */
export type Template = 'app' | 'widget';

/** What `scaffold` needs to write a project. */
export interface ScaffoldOptions {
  /** The directory that holds the `base`, `tailwind` and `widget` template folders. */
  templateRoot: string;
  /** The directory to write into. */
  target: string;
  /** The package name of the new project. */
  name: string;
  /** Whether to layer Tailwind CSS on top of the base template. */
  tailwind: boolean;
  /** Which project to write: an `app`, or an embeddable `widget`. Defaults to `app`. */
  template?: Template;
  /** The version of `ecmact` the project depends on. */
  ecmactVersion: string;
}

/**
 * Writes a new project from the template: copies the base files, layers the widget or Tailwind overlay on
 * top if asked, renames `_gitignore` and fills in the project name and the `ecmact` version. Only the files
 * that come from the template are written or changed; anything else in the target is left alone.
 *
 * @param options - The template location, the target directory and the choices.
 * @returns The files that were written, relative to the target and sorted.
 */
export const scaffold = async ({
  templateRoot,
  target,
  name,
  tailwind,
  template = 'app',
  ecmactVersion,
}: ScaffoldOptions) => {
  const base = join(templateRoot, 'base');
  const overlayName = template === 'widget' ? 'widget' : tailwind ? 'tailwind' : undefined;
  const overlay = overlayName ? join(templateRoot, overlayName) : undefined;
  const layers = overlay ? [base, overlay] : [base];
  const removed = overlay ? await readRemoved(overlay) : [];
  const relatives = new Set(
    (
      await Promise.all(
        layers.map(async (layer) => (await walk(layer)).map((file) => relative(layer, file))),
      )
    )
      .flat()
      .filter((file) => file !== '_remove' && !removed.includes(file)),
  );

  await mkdir(target, { recursive: true });
  await cp(base, target, { recursive: true });

  if (overlay) {
    const overlayPackage = JSON.parse(
      await readFile(join(overlay, 'package.json'), 'utf8'),
    ) as Json;
    const basePackage = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as Json;
    await cp(overlay, target, {
      recursive: true,
      /**
       * Skips the overlay's `package.json`, which is merged into the base one, and its `_remove` list.
       *
       * @param source - The path being copied.
       * @returns `false` for those two files.
       */
      filter: (source) => !source.endsWith('package.json') && !source.endsWith('_remove'),
    });
    await removeFiles(target, removed);
    await writeFile(
      join(target, 'package.json'),
      `${JSON.stringify(mergeJson(basePackage, overlayPackage), null, 2)}\n`,
    );
  }

  await rename(join(target, '_gitignore'), join(target, '.gitignore'));

  const written = [...relatives].map((file) => (file === '_gitignore' ? '.gitignore' : file));
  await Promise.all(
    written.map(async (file) => {
      const path = join(target, file);
      const text = await readFile(path, 'utf8');
      const filled = text
        .replaceAll('{{name}}', name)
        .replaceAll('{{ecmactVersion}}', ecmactVersion);
      if (filled !== text) await writeFile(path, filled);
    }),
  );

  return written.sort();
};
