import type { Router } from 'ecmact';
import { text } from '@site/content/messages';
import { link, view } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { external, outside } from '@site/ui/header';

/**
 * The footer: where to go next, and where the code is.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Footer = (router: Router) => {
  const m = text().footer;
  return view('Footer', {
    tag: 'footer',
    class: 'site-footer',
    children: [
      view('Inner', {
        class: 'wrap footer-grid',
        children: [
          el(
            'div',
            {},
            el('strong', {}, 'ECMact'),
            el('p', {}, m.tagline),
            el(
              'p',
              { class: 'muted' },
              m.selfMade,
              outside(`${external.github}/tree/main/packages/site`, m.source),
            ),
          ),
          el(
            'div',
            {},
            el('strong', {}, m.learn),
            link(router, '/docs/getting-started', m.gettingStarted),
            link(router, '/docs/components', m.components),
            link(router, '/docs/signals', m.signals),
            link(router, '/examples', m.examples),
          ),
          el(
            'div',
            {},
            el('strong', {}, m.build),
            link(router, '/docs/routing', m.routing),
            link(router, '/docs/state', m.state),
            link(router, '/docs/http', m.http),
            link(router, '/docs/widgets', m.widgets),
          ),
          el(
            'div',
            {},
            el('strong', {}, m.project),
            outside(external.github, 'GitHub'),
            outside(external.npm, 'npm'),
            outside(`${external.github}/issues`, m.issues),
            outside(`${external.github}/security/policy`, m.security),
          ),
        ],
      }),
    ],
  });
};
