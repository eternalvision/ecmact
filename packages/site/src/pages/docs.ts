import { tags, type Router } from 'ecmact';
import { neighbours } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import type { DocPage } from '@site/content/types';
import { currentLocale } from '@site/lib/i18n';
import { followInternalLinks } from '@site/lib/links';
import { renderBlocks } from '@site/ui/blocks';
import { external, outside } from '@site/ui/header';
import { Sidebar } from '@site/ui/sidebar';
import { SkipLinks } from '@site/ui/skipLinks';
import { Toc, tocId } from '@site/ui/toc';

const { article, h1, main, nav, p, span } = tags;

/** The id of the title of the article, which the skip link moves the focus to. */
const articleId = 'docs-article';

/**
 * Moves the focus to the title of the article. After a keyboard user opens a topic or the next page the link they
 * used is gone with the old page, and the focus would fall back to the top of the document.
 */
const focusArticle = () => {
  document.getElementById(articleId)?.focus({ preventScroll: true });
};

/**
 * A documentation page: the sidebar, the article and the table of contents, with the links to the pages around it.
 * Skip links lead a keyboard user from the sidebar into the article and to the sections of the page.
 *
 * @param router - The router.
 * @param page - The page to show.
 * @returns The page.
 */
export const docsPage = (router: Router, page: DocPage) => {
  const { nodes, headings } = renderBlocks(page.blocks);
  const m = text().docs;
  const { previous, next } = neighbours(page.slug, currentLocale());

  const sections = headings.length > 1;

  return main(
    {
      class: 'wrap docs',
      /**
       * Hands the focus to the new article when a topic or the previous or next page was opened through the router.
       *
       * @param event - The click, after the link handled it.
       */
      onclick: (event: MouseEvent) => {
        const link =
          event.target instanceof Element && event.target.closest('.sidebar a, .pager a');
        if (link && event.defaultPrevented) setTimeout(focusArticle);
      },
    },
    SkipLinks([
      { label: m.skipArticle, target: articleId },
      ...(sections ? [{ label: m.skipToc, target: tocId }] : []),
    ]),
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
      h1({ id: articleId, tabindex: -1 }, page.title),
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
    sections ? Toc(headings) : span(),
  );
};
