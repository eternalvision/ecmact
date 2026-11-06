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
