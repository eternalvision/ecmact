import { tags, type Router } from 'ecmact';
import { docsFor, groups } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import { currentLocale } from '@site/lib/i18n';

const { div, h2, nav } = tags;

/**
 * The navigation of the documentation: every page, by group. The router marks the current page.
 *
 * @param router - The router.
 * @returns The `nav` element.
 */
export const Sidebar = (router: Router) => {
  const m = text().docs;
  const pages = docsFor(currentLocale());
  return nav(
    { class: 'sidebar', 'aria-label': m.navLabel },
    groups.map((group) =>
      div(
        { class: 'sidebar-group' },
        h2(m.groups[group]),
        pages
          .filter((page) => page.group === group)
          .map((page) => router.link({ to: `/docs/${page.slug}` }, page.title)),
      ),
    ),
  );
};
