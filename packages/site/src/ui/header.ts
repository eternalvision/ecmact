import { computed, signal, type Router } from 'ecmact';
import { link, tag, view } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { Logo } from '@site/ui/logo';
import { ThemeToggle } from '@site/ui/themeToggle';

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
  el('a', { class: className, attrs: { href, target: '_blank', rel: 'noreferrer' } }, label);

/**
 * The header: logo, navigation, links to the code and the theme toggle. On a narrow screen the navigation opens
 * from a button.
 *
 * @param router - The router.
 * @returns The component.
 */
export const Header = (router: Router) => {
  const open = signal(false);
  /**
   * Closes the menu.
   */
  const close = () => {
    open.value = false;
  };

  return view('Header', {
    tag: 'header',
    class: 'site-header',
    children: [
      view('Bar', {
        class: 'wrap bar',
        children: [
          Logo(router),
          tag('button', {
            type: 'button',
            class: 'menu',
            content: computed(() => (open.value ? 'Close' : 'Menu')),
            'aria-expanded': computed(() => String(open.value)),
            'aria-controls': 'site-nav',
            /**
             * Opens or closes the menu.
             */
            onclick: () => {
              open.value = !open.value;
            },
          }),
          view('Nav', {
            tag: 'nav',
            id: 'site-nav',
            class: 'nav',
            'data-open': computed(() => String(open.value)),
            onclick: close,
            children: [
              link(router, '/docs', 'Docs'),
              link(router, '/examples', 'Examples'),
              outside(external.widget, 'Widget demo'),
              outside(external.starter, 'Starter'),
              outside(external.github, 'GitHub'),
              outside(external.npm, 'npm'),
              ThemeToggle(),
            ],
          }),
        ],
      }),
    ],
  });
};
