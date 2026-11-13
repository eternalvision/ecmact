import { tags } from 'ecmact';
import { withBase } from '@site/lib/paths';

const { a, code, strong } = tags;

const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/;

/**
 * Turns a piece of text with light markup into nodes: `code`, **bold** and [links](/docs/routing). A link that
 * starts with a slash stays inside the site; it gets the base path and a marker, so that the page can follow it
 * without a reload. Nothing is ever parsed as HTML.
 *
 * @example
 * parseInline('Use `signal()` from [signals](/docs/signals).');
 *
 * @param text - The text.
 * @returns The nodes to put into an element.
 */
export const parseInline = (text: string): (Node | string)[] =>
  text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => {
      if (part.startsWith('`')) return code(part.slice(1, -1));
      if (part.startsWith('**')) return strong(part.slice(2, -2));
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (!link) return part;
      const [, label, href] = link as unknown as [string, string, string];
      const internal = href.startsWith('/');
      return a(
        internal
          ? { href: withBase(href), 'data-internal': href }
          : { href, target: '_blank', rel: 'noreferrer' },
        label,
      );
    });
