import { tags, type Router } from 'ecmact';
import { neighbours } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import type { DocPage } from '@site/content/types';
import { currentLocale } from '@site/lib/i18n';
import { followInternalLinks } from '@site/lib/links';
import { renderBlocks } from '@site/ui/blocks';
import { external, outside } from '@site/ui/header';
import { Sidebar } from '@site/ui/sidebar';
import { Toc } from '@site/ui/toc';

const { article, div, h1, nav, p, span } = tags;

/**
 * A documentation page: the sidebar, the article and the table of contents, with the links to the pages around it.
 *
 * @param router - The router.
 * @param page - The page to show.
 * @returns The page.
 */
export const docsPage = (router: Router, page: DocPage) => {
  const { nodes, headings } = renderBlocks(page.blocks);
  const m = text().docs;
  const { previous, next } = neighbours(page.slug, currentLocale());

  return div(
    { class: 'wrap docs' },
    Sidebar(router),
    article(
      {
        class: 'prose',
        /**
         * Makes the links inside the text navigate through the router.
         *
         * @param element - The article.
         */
        ref: (element) => {
          followInternalLinks(element, router);
        },
      },
      p({ class: 'eyebrow' }, m.groups[page.group]),
      h1(page.title),
      p({ class: 'lead' }, page.summary),
      nodes,
      nav(
        { class: 'pager', 'aria-label': m.pagerLabel },
        previous
          ? router.link(
              { to: `/docs/${previous.slug}`, class: 'pager-link' },
              `← ${previous.title}`,
            )
          : span(),
        next
          ? router.link({ to: `/docs/${next.slug}`, class: 'pager-link next' }, `${next.title} →`)
          : span(),
      ),
      p(
        { class: 'muted edit' },
        outside(
          `${external.github}/blob/main/packages/site/src/content/docs/${page.slug}.ts`,
          m.edit,
        ),
      ),
    ),
    headings.length > 1 ? Toc(headings) : span(),
  );
};
