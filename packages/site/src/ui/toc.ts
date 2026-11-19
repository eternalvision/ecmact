import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import type { Heading } from '@site/ui/blocks';

const { a, li, nav, strong, ul } = tags;

/** The id of the title of the table of contents, which the skip link of the page moves the focus to. */
export const tocId = 'docs-toc';

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
    strong({ id: tocId, class: 'toc-title', tabindex: -1 }, text().docs.onThisPage),
    ul(
      headings.map((heading) =>
        li(
          { class: heading.level === 3 && 'toc-sub' },
          a({ href: `#${heading.id}` }, heading.text),
        ),
      ),
    ),
  );
