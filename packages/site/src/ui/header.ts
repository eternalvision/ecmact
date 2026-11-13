import { signal, tags, type Router } from 'ecmact';
import { text } from '@site/content/messages';
import { LanguageToggle } from '@site/ui/languageToggle';
import { Logo } from '@site/ui/logo';
import { ThemeToggle } from '@site/ui/themeToggle';

const { a, button, div, header, nav } = tags;

/** The links that leave the site. */
export const external = {
  github: 'https://github.com/eternalvision/ecmact',
  npm: 'https://www.npmjs.com/package/ecmact',
  widget: 'https://eternalvision.github.io/ecmact/widget/',
  starter: 'https://eternalvision.github.io/ecmact/starter/',
};

/**
 * Makes a link to another site.
 *
 * @param href - The address.
 * @param label - The text.
 * @param className - The class.
 * @returns The anchor.
 */
export const outside = (href: string, label: string, className = '') =>
  a({ class: className, href, target: '_blank', rel: 'noreferrer' }, label);

/**
 * The header: logo, navigation, links to the code and the theme toggle. On a narrow screen the navigation opens
 * from a button.
 *
 * @param router - The router.
 * @returns The `header` element.
 */
export const Header = (router: Router) => {
  const m = text().nav;
  const open = signal(false);

  /**
   * Tells whether the menu is open, for the attributes that say so.
   *
   * @returns `true` or `false`, as text.
   */
  const state = () => String(open.value);

  return header(
    { class: 'site-header' },
    div(
      { class: 'wrap bar' },
      Logo(router),
      button(
        {
          type: 'button',
          class: 'menu',
          'aria-expanded': state,
          'aria-controls': 'site-nav',
          /**
           * Opens or closes the menu.
           */
          onclick: () => {
            open.value = !open.value;
          },
        },
        () => (open.value ? m.close : m.menu),
      ),
      nav(
        {
          id: 'site-nav',
          class: 'nav',
          'data-open': state,
          /**
           * Closes the menu.
           */
          onclick: () => {
            open.value = false;
          },
        },
        router.link({ to: '/docs' }, m.docs),
        router.link({ to: '/examples' }, m.examples),
        router.link({ to: '/widgets' }, m.widgets),
        outside(external.starter, m.starter),
        outside(external.github, 'GitHub'),
        outside(external.npm, 'npm'),
        LanguageToggle(),
        ThemeToggle(),
      ),
    ),
  );
};
