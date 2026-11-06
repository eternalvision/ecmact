import type { Router } from 'ecmact';
import { text } from '@site/content/messages';
import { link } from '@site/lib/component';
import { el } from '@site/lib/dom';

/**
 * The page for an address that matches nothing.
 *
 * @param router - The router.
 * @returns The page.
 */
export const notFound = (router: Router) => {
  const m = text().notFound;
  return el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, m.title),
    el('p', { class: 'lead' }, m.lead),
    el(
      'p',
      {},
      link(router, '/', m.home, 'button'),
      ' ',
      link(router, '/docs', m.docs, 'button ghost'),
    ),
  );
};
