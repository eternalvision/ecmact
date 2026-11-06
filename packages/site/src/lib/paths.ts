/**
 * Reads the base path the site is served from, without a trailing slash: `/ecmact` on GitHub Pages, empty in development.
 *
 * @returns The base path.
 */
export const basePath = () => import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Turns an app path into the URL that the browser needs, with the base in front.
 *
 * @param path - A path inside the site, starting with a slash.
 * @returns The path with the base.
 */
export const withBase = (path: string) => `${basePath()}${path}`;
