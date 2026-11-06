/**
 * Removes the slashes at the end of a path. A loop instead of a regular expression, which a long run of slashes
 * followed by another character could make slow.
 *
 * @param path - The path.
 * @returns The path without trailing slashes.
 */
export const trimSlashes = (path: string) => {
  let end = path.length;
  while (end > 0 && path[end - 1] === '/') end--;
  return path.slice(0, end);
};

/**
 * Reads the base path the site is served from, without a trailing slash: `/ecmact` on GitHub Pages, empty in development.
 *
 * @returns The base path.
 */
export const basePath = () => trimSlashes(import.meta.env.BASE_URL);

/**
 * Turns an app path into the URL that the browser needs, with the base in front.
 *
 * @param path - A path inside the site, starting with a slash.
 * @returns The path with the base.
 */
export const withBase = (path: string) => `${basePath()}${path}`;
