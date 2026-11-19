import { tags, type Router } from 'ecmact';
import { docsFor, groups } from '@site/content/docs/index';
import { text } from '@site/content/messages';
import { currentLocale } from '@site/lib/i18n';

const { details, div, li, nav, strong, summary, ul } = tags;

/** The width up to which the topics fold into a toggle, as in the stylesheet. */
const narrow = '(max-width: 520px)';

/**
 * The navigation of the documentation: every page, by group, as lists under the title of the group. The router
 * marks the current page with `aria-current`. On a narrow screen the lists sit in a closed `details` named "Topics"
 * with the current page in its summary, so the article starts on the first screen; on a wide one it stays open and
 * its summary is hidden.
 *
 * @param router - The router.
 * @returns The `nav` element.
 */
export const Sidebar = (router: Router) => {
  const m = text().docs;
  const pages = docsFor(currentLocale());
  const current = pages.find((page) => router.location.value.path === `/docs/${page.slug}`);
  return nav(
    { class: 'sidebar', 'aria-label': m.navLabel },
    details(
      {
        class: 'sidebar-topics',
        /**
         * Opens the details on a wide screen and closes them on a narrow one, now and whenever the width crosses the
         * limit. Stops listening when the navigation has left the page.
         *
         * @param element - The details element.
         */
        ref: (element) => {
          const query = window.matchMedia(narrow);
          /**
           * Opens the details on a wide screen and closes them on a narrow one.
           */
          const apply = () => {
            element.toggleAttribute('open', !query.matches);
          };
          /**
           * Follows the width, or stops when the details are gone.
           */
          const onChange = () => {
            if (element.isConnected) apply();
            else query.removeEventListener('change', onChange);
          };
          apply();
          query.addEventListener('change', onChange);
        },
      },
      summary(current ? `${m.topics}: ${current.title}` : m.topics),
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
    ),
  );
};
