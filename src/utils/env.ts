/**
 * The globals of the page that the library checks for before it uses them. Reading them through this module,
 * and not with `typeof`, lets a test replace them with `vi.mock`, also in a real browser, where they cannot be
 * removed. Internal: not exported from the package.
 */

/**
 * Returns the document of the page.
 *
 * @returns The document, or `undefined` outside a page (a server, a worker).
 */
export const pageDocument = (): Document | undefined => globalThis.document;

/**
 * Returns the location of the page.
 *
 * @returns The location, or `undefined` outside a page.
 */
export const pageLocation = (): Location | undefined => globalThis.location;

/**
 * Returns the `HTMLElement` class of the page, the base of every component.
 *
 * @returns The class, or `undefined` where there is no DOM.
 */
export const pageHTMLElement = (): typeof HTMLElement | undefined => globalThis.HTMLElement;

/**
 * Leaves the page for a URL, as a link to another origin does.
 *
 * @param href - The URL.
 */
export const leavePage = (href: string) => {
  globalThis.location.assign(href);
};
