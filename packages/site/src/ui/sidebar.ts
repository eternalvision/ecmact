import { tags, type Router } from 'ecmact';
import { docsFor, groups } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import { currentLocale } from '@site/lib/i18n';

const { div, li, nav, strong, ul } = tags;

/**
 * The navigation of the documentation: every page, by group, as lists under the title of the group. The router
 * marks the current page with `aria-current`.
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
        strong({ class: 'sidebar-title' }, m.groups[group]),
        ul(
          pages
            .filter((page) => page.group === group)
            .map((page) => li(router.link({ to: `/docs/${page.slug}` }, page.title))),
        ),
      ),
    ),
  );
};
