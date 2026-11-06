import type { Router } from 'ecmact';
import { el } from '@site/lib/dom';
import { link } from '@site/lib/component';
import { withBase } from '@site/lib/paths';

/**
 * The logo as a link to the home page.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Logo = (router: Router) => {
  const anchor = link(router, '/', '', 'logo');
  anchor.setState({
    'aria-label': 'ECMact, home',
    children: [
      el('img', {
        attrs: { src: withBase('/ecmact-logo.png'), alt: '', width: '856', height: '283' },
      }),
    ],
  } as never);
  return anchor;
};
