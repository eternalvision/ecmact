import type { Router } from 'ecmact';
import { docs, groups } from '@site/content/docs/index';
import { link, view } from '@site/lib/component';
import { el } from '@site/lib/dom';

/**
 * The navigation of the documentation: every page, by group. The router marks the current page.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Sidebar = (router: Router) =>
  view('Sidebar', {
    tag: 'nav',
    class: 'sidebar',
    'aria-label': 'Documentation',
    children: groups.map((group) =>
      el(
        'div',
        { class: 'sidebar-group' },
        el('h2', {}, group),
        ...docs
          .filter((page) => page.group === group)
          .map((page) => link(router, `/docs/${page.slug}`, page.title)),
      ),
    ),
  });
