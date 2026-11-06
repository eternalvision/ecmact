import type { Router } from 'ecmact';
import { link, view } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { external, outside } from '@site/ui/header';

/**
 * The footer: where to go next, and where the code is.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Footer = (router: Router) =>
  view('Footer', {
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
            el('p', {}, 'Reactive interfaces on native Web Components. MIT licensed.'),
            el(
              'p',
              { class: 'muted' },
              'This site is written with ECMact itself. ',
              outside(`${external.github}/tree/main/packages/site`, 'Read its source.'),
            ),
          ),
          el(
            'div',
            {},
            el('strong', {}, 'Learn'),
            link(router, '/docs/getting-started', 'Getting started'),
            link(router, '/docs/components', 'Components'),
            link(router, '/docs/signals', 'Signals'),
            link(router, '/examples', 'Examples'),
          ),
          el(
            'div',
            {},
            el('strong', {}, 'Build'),
            link(router, '/docs/routing', 'Routing'),
            link(router, '/docs/state', 'State management'),
            link(router, '/docs/http', 'HTTP client'),
            link(router, '/docs/widgets', 'Widgets'),
          ),
          el(
            'div',
            {},
            el('strong', {}, 'Project'),
            outside(external.github, 'GitHub'),
            outside(external.npm, 'npm'),
            outside(`${external.github}/issues`, 'Issues'),
            outside(`${external.github}/security/policy`, 'Security'),
          ),
        ],
      }),
    ],
  });
