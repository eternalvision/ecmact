import { findDoc } from '@site/content/docs/index';
import { messages } from '@site/content/messages';
import type { Locale } from '@site/lib/i18n';

const site = 'ECMact';

/** The title and description of a page. */
export interface PageMeta {
  /** The text of the `title` element. */
  title: string;
  /** The text of the description meta tag. */
  description: string;
}

/**
 * Works out the title and the description of the page at a path, in a language.
 *
 * @param path - The path inside the site, without the base.
 * @param locale - The language.
 * @returns The title and the description.
 */
export const metaFor = (path: string, locale: Locale = 'en'): PageMeta => {
  const m = messages[locale].meta;
  if (path === '/examples') {
    return { title: `${m.examplesTitle} - ${site}`, description: m.examplesDescription };
  }
  if (path === '/widgets') {
    return { title: `${m.widgetsTitle} - ${site}`, description: m.widgetsDescription };
  }
  const doc = path.startsWith('/docs/')
    ? findDoc(path.slice('/docs/'.length).replace(/\/$/, ''), locale)
    : undefined;
  if (doc) return { title: `${doc.title} - ${site} ${m.docsSuffix}`, description: doc.summary };
  if (path === '/' || path === '')
    return { title: `${site} - ${m.tagline}`, description: m.summary };
  return { title: `${m.notFound} - ${site}`, description: m.summary };
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
