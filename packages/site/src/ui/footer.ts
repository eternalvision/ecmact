import { tags, type Router } from 'ecmact';
import { text } from '@site/content/messages';
import { external, outside } from '@site/ui/header';

const { div, footer, p, strong } = tags;

/**
 * The footer: where to go next, and where the code is.
 *
 * @param router - The router.
 * @returns The `footer` element.
 */
export const Footer = (router: Router) => {
  const m = text().footer;
  return footer(
    { class: 'site-footer' },
    div(
      { class: 'wrap footer-grid' },
      div(
        strong('ECMact'),
        p(m.tagline),
        p(
          { class: 'muted' },
          m.selfMade,
          outside(`${external.github}/tree/main/packages/site`, m.source),
        ),
      ),
      div(
        strong(m.learn),
        router.link({ to: '/docs/getting-started' }, m.gettingStarted),
        router.link({ to: '/docs/components' }, m.components),
        router.link({ to: '/docs/signals' }, m.signals),
        router.link({ to: '/examples' }, m.examples),
      ),
      div(
        strong(m.build),
        router.link({ to: '/docs/routing' }, m.routing),
        router.link({ to: '/docs/state' }, m.state),
        router.link({ to: '/docs/http' }, m.http),
        router.link({ to: '/docs/widgets' }, m.widgets),
      ),
      div(
        strong(m.project),
        outside(external.github, 'GitHub'),
        outside(external.npm, 'npm'),
        outside(`${external.github}/issues`, m.issues),
        outside(`${external.github}/security/policy`, m.security),
      ),
    ),
  );
};
