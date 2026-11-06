import type { Router } from 'ecmact';
import { neighbours } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import type { DocPage } from '@site/content/types';
import { link } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { currentLocale } from '@site/lib/i18n';
import { followInternalLinks } from '@site/lib/links';
import { renderBlocks } from '@site/ui/blocks';
import { external, outside } from '@site/ui/header';
import { Sidebar } from '@site/ui/sidebar';
import { Toc } from '@site/ui/toc';

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

  const article = el(
    'article',
    { class: 'prose' },
    el('p', { class: 'eyebrow' }, m.groups[page.group]),
    el('h1', {}, page.title),
    el('p', { class: 'lead' }, page.summary),
    ...nodes,
    el(
      'nav',
      { class: 'pager', attrs: { 'aria-label': m.pagerLabel } },
      previous
        ? link(router, `/docs/${previous.slug}`, `← ${previous.title}`, 'pager-link')
        : el('span'),
      next ? link(router, `/docs/${next.slug}`, `${next.title} →`, 'pager-link next') : el('span'),
    ),
    el(
      'p',
      { class: 'muted edit' },
      outside(
        `${external.github}/blob/main/packages/site/src/content/docs/${page.slug}.ts`,
        m.edit,
      ),
    ),
  );
  followInternalLinks(article, router);

  return el(
    'div',
    { class: 'wrap docs' },
    Sidebar(router),
    article,
    headings.length > 1 ? Toc(headings) : el('span'),
  );
};
