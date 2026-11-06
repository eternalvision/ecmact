import { readdir, readFile, rm, rmdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

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
export const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
};

/**
 * Deletes files from the project and the directories they leave empty.
 *
 * @param target - The project directory.
 * @param files - The files to delete, relative to the project.
 */
export const removeFiles = async (target: string, files: string[]) => {
  await Promise.all(files.map((file) => rm(join(target, file), { force: true })));
  for (const file of files) {
    let directory = dirname(join(target, file));
    while (directory !== target) {
      try {
        await rmdir(directory);
      } catch {
        break;
      }
      directory = dirname(directory);
    }
  }
};

/**
 * Reads the list of base files that an overlay deletes, from its `_remove` file.
 *
 * @param overlay - The overlay directory.
 * @returns The paths relative to the project, or an empty list if the overlay has no such file.
 */
export const readRemoved = async (overlay: string) => {
  try {
    return (await readFile(join(overlay, '_remove'), 'utf8')).split('\n').filter(Boolean);
  } catch {
    return [];
  }
};
