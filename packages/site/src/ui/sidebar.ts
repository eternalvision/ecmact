import type { Router } from 'ecmact';
import { docsFor, groups } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import { link, view } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { currentLocale } from '@site/lib/i18n';

/**
 * The navigation of the documentation: every page, by group. The router marks the current page.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Sidebar = (router: Router) => {
  const m = text().docs;
  const pages = docsFor(currentLocale());
  return view('Sidebar', {
    tag: 'nav',
    class: 'sidebar',
    'aria-label': m.navLabel,
    children: groups.map((group) =>
      el(
        'div',
        { class: 'sidebar-group' },
        el('h2', {}, m.groups[group]),
        ...pages
          .filter((page) => page.group === group)
          .map((page) => link(router, `/docs/${page.slug}`, page.title)),
      ),
    ),
  });
};
