import { tags, type Router } from 'ecmact';
import { text } from '@site/content/messages';
import { withBase } from '@site/lib/paths';

/**
 * The logo as a link to the home page.
 *
 * @param router - The router.
 * @returns The anchor.
 */
export const Logo = (router: Router) =>
  router.link(
    { to: '/', class: 'logo', 'aria-label': text().chrome.home },
    tags.img({ src: withBase('/ecmact-logo.png'), alt: '', width: 856, height: 283 }),
  );
