import { findDoc } from '@site/content/docs/index';

const site = 'ECMact';

/** The title and description of a page. */
export interface PageMeta {
  /** The text of the `title` element. */
  title: string;
  /** The text of the description meta tag. */
  description: string;
}

const tagline = 'Reactive interfaces on native Web Components';
const summary =
  'ECMact is a small library for reactive interfaces on native Web Components: signals, a router, a store, an HTTP client, styled components and embeddable widgets, with no dependencies.';

/**
 * Works out the title and the description of the page at a path.
 *
 * @param path - The path inside the site, without the base.
 * @returns The title and the description.
 */
export const metaFor = (path: string): PageMeta => {
  if (path === '/examples') {
    return {
      title: `Examples - ${site}`,
      description:
        'Live ECMact demos with their source: signals, stores, styled components, an HTTP client and forms.',
    };
  }
  const doc = path.startsWith('/docs/')
    ? findDoc(path.slice('/docs/'.length).replace(/\/$/, ''))
    : undefined;
  if (doc) return { title: `${doc.title} - ${site} docs`, description: doc.summary };
  if (path === '/' || path === '') return { title: `${site} - ${tagline}`, description: summary };
  return { title: `Not found - ${site}`, description: summary };
};

/**
 * Puts the title and the description of a page into the document.
 *
 * @param meta - The title and the description.
 */
export const applyMeta = (meta: PageMeta) => {
  document.title = meta.title;
  let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.append(tag);
  }
  tag.content = meta.description;
};
