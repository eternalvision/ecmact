import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import type { Heading } from '@site/ui/blocks';

const { a, h2, li, nav, ul } = tags;

/**
 * The table of contents of a page: its headings as links to anchors. Anchors are plain `#id` links, so the browser
 * scrolls to them without the router.
 *
 * @param headings - The headings of the page.
 * @returns The navigation element.
 */
export const Toc = (headings: Heading[]) =>
  nav(
    { class: 'toc', 'aria-label': text().docs.onThisPage },
    h2(text().docs.onThisPage),
    ul(
      headings.map((heading) =>
        li(
          { class: heading.level === 3 && 'toc-sub' },
          a({ href: `#${heading.id}` }, heading.text),
        ),
      ),
    ),
  );
