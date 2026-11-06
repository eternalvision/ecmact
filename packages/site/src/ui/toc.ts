import { el } from '@site/lib/dom';
import type { Heading } from '@site/ui/blocks';

/**
 * The table of contents of a page: its headings as links to anchors. Anchors are plain `#id` links, so the browser
 * scrolls to them without the router.
 *
 * @param headings - The headings of the page.
 * @returns The navigation element.
 */
export const Toc = (headings: Heading[]) =>
  el(
    'nav',
    { class: 'toc', attrs: { 'aria-label': 'On this page' } },
    el('h2', {}, 'On this page'),
    el(
      'ul',
      {},
      ...headings.map((heading) =>
        el(
          'li',
          { class: heading.level === 3 ? 'toc-sub' : undefined },
          el('a', { attrs: { href: `#${heading.id}` } }, heading.text),
        ),
      ),
    ),
  );
