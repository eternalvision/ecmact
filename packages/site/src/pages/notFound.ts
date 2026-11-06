import type { Router } from 'ecmact';
import { link } from '@site/lib/component';
import { el } from '@site/lib/dom';

/**
 * The page for an address that matches nothing.
 *
 * @param router - The router.
 * @returns The page.
 */
export const notFound = (router: Router) =>
  el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, 'Page not found'),
    el('p', { class: 'lead' }, 'There is nothing at this address.'),
    el(
      'p',
      {},
      link(router, '/', 'Back to the home page', 'button'),
      ' ',
      link(router, '/docs', 'Read the docs', 'button ghost'),
    ),
  );
