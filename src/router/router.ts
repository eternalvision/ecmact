import type { Component } from '@em/component';
import { em } from '@em/em';
import { matchPath, compilePattern } from '@em/router/match';
import { computed, effect, signal, untracked, type ReadonlySignal } from '@em/signals';
import { tags } from '@em/tags';
import type { ComponentProps } from '@em/types';

/** The part of the URL a router works with. */
export interface RouterLocation {
  /** The pathname without the base, for example `/users/1`. */
  path: string;
  /** The query string. */
  query: URLSearchParams;
  /** The hash including `#`, or an empty string. */
  hash: string;
}

/** What a view receives: the location, the matched parameters and the router. */
export interface RouteContext extends RouterLocation {
  /** The decoded parameters of the matched pattern; `*` holds the rest of a wildcard. */
  params: Record<string, string>;
  /** The router, for navigating from inside a view. */
  router: Router;
}

/**
 * Renders a route. It may return a promise, which is how views are loaded lazily.
 *
 * @param context - The location and the matched parameters.
 * @returns The node to show, or a promise of it.
 */
type View = (context: RouteContext) => Node | Promise<Node>;

/** Maps a path pattern to a view. */
export interface Route {
  /** The pattern: `/`, `/about`, `/users/:id`, `/files/*` or `*`. The first matching route wins. */
  path: string;
  /** Renders the route. */
  view: View;
}

/** The route that matches the current path. */
export interface RouteMatch {
  /** The matched route. */
  route: Route;
  /** The decoded parameters. */
  params: Record<string, string>;
}

/** Options for `createRouter`. */
export interface RouterOptions {
  /** The routes, checked in order. */
  routes: Route[];
  /** A path prefix the app is served from, for example `/app`. */
  base?: string;
  /** The view for paths that no route matches. Without it the outlet stays empty. */
  notFound?: View;
}

/** Options for `navigate`. */
export interface NavigateOptions {
  /** Replaces the current history entry instead of adding one. */
  replace?: boolean;
  /** Scrolls to the top after navigating. Defaults to `true`. */
  scroll?: boolean;
}

/** Props of `router.link`: the props of an anchor, with the target in `to` instead of `href`. */
export type LinkProps = Omit<ComponentProps<'a'>, 'tag' | 'href'> & {
  /** The target: an app path starting with `/` (the base is added) or a URL. */
  to: string;
  /** Replaces the current history entry instead of adding one. */
  replace?: boolean;
};

/** Props for the outlet element: any component props except the ones the router controls. */
export type OutletProps = Omit<ComponentProps<'div'>, 'tag' | 'children' | 'mounted'>;

/** A router: the current location as a signal, plus navigation and the components that show it. */
export interface Router {
  /** The current location. Updates on `navigate` and on back and forward. */
  readonly location: ReadonlySignal<RouterLocation>;
  /** The route that matches the current path, or `undefined`. */
  readonly match: ReadonlySignal<RouteMatch | undefined>;
  /**
   * Navigates to a path or URL.
   *
   * @param to - An app path starting with `/` (the base is added), or a URL.
   * @param options - Whether to replace the entry and whether to scroll to the top.
   */
  navigate(to: string, options?: NavigateOptions): void;
  /** Goes one entry back in the history. */
  back(): void;
  /** Goes one entry forward in the history. */
  forward(): void;
  /**
   * Creates an anchor that navigates without a page load on plain left clicks.
   *
   * @param props - The anchor props plus `to` and `replace`.
   * @returns The anchor component.
   */
  link(props: LinkProps): Component<'a'>;
  /**
   * Creates a component that renders the view of the current route.
   *
   * @param props - Props for the outlet element.
   * @returns The outlet component.
   */
  outlet(props?: OutletProps): Component<'div'>;
  /** Stops listening to `popstate`. */
  dispose(): void;
}

/**
 * Removes the base path from a pathname. Paths outside the base are returned as they are.
 *
 * @param pathname - The pathname of a URL.
 * @param base - The base path without a trailing slash, or an empty string.
 * @returns The pathname relative to the base, `/` for the base itself.
 */
const stripBase = (pathname: string, base: string) =>
  base !== '' && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length) || '/'
    : pathname;

/**
 * Reads the current browser location, relative to the base.
 *
 * @param base - The base path without a trailing slash, or an empty string.
 * @returns The path, query and hash.
 */
const readLocation = (base: string): RouterLocation => ({
  path: stripBase(window.location.pathname, base),
  query: new URLSearchParams(window.location.search),
  hash: window.location.hash,
});

/**
 * Tells whether a view result is a promise.
 *
 * @param value - What a view returned.
 * @returns `true` for thenables.
 */
const isPromise = (value: unknown): value is Promise<Node> =>
  typeof (value as Promise<Node> | undefined)?.then === 'function';

/**
 * Tells whether a link target stays on the current origin.
 *
 * @param to - The link target.
 * @param base - The base path without a trailing slash, or an empty string.
 * @returns `true` if the browser would stay on this origin.
 */
const isInternal = (to: string, base: string) =>
  new URL(to.startsWith('/') ? base + to : to, window.location.href).origin ===
  window.location.origin;

/**
 * Creates a router that maps URLs to views through the History API.
 * The location is a signal, so components, effects and computed values can follow it.
 *
 * @example
 * const router = createRouter({ routes: [{ path: '/', view: () => tags.h1({ content: 'Home' }) }] });
 * mount('#app', router.outlet());
 *
 * @param options - The routes, the optional base path and the view for unknown paths.
 * @returns The router.
 */
export const createRouter = ({ routes, base: rawBase = '', notFound }: RouterOptions): Router => {
  const base = rawBase.replace(/\/+$/, '');
  const compiled = routes.map((route) => ({ route, pattern: compilePattern(route.path) }));
  const location = signal(readLocation(base));
  /**
   * Copies the browser location into the `location` signal.
   */
  const synchronize = () => {
    location.value = readLocation(base);
  };
  window.addEventListener('popstate', synchronize);

  const match = computed<RouteMatch | undefined>(() => {
    for (const { route, pattern } of compiled) {
      const params = matchPath(pattern, location.value.path);
      if (params) return { route, params };
    }
    return undefined;
  });

  const viewKey = computed(() => `${location.value.path}?${location.value.query.toString()}`);

  /**
   * Navigates to a path or URL. Urls on another origin are handed to the browser.
   * Navigating to the current url replaces the history entry instead of adding one.
   *
   * @param to - An app path starting with `/` (the base is added), or a URL.
   * @param options - Whether to replace the entry and whether to scroll to the top.
   */
  const navigate = (to: string, { replace = false, scroll = true }: NavigateOptions = {}) => {
    const url = new URL(to.startsWith('/') ? base + to : to, window.location.href);
    if (url.origin !== window.location.origin) {
      window.location.assign(url.href);
      return;
    }
    const target = url.pathname + url.search + url.hash;
    const current = window.location.pathname + window.location.search + window.location.hash;
    window.history[replace || target === current ? 'replaceState' : 'pushState'](null, '', target);
    synchronize();
    if (scroll) window.scrollTo(0, 0);
  };

  const router: Router = {
    location,
    match,
    navigate,
    /**
     * Goes one entry back in the history.
     */
    back: () => {
      window.history.back();
    },
    /**
     * Goes one entry forward in the history.
     */
    forward: () => {
      window.history.forward();
    },
    /**
     * Stops listening to `popstate`.
     */
    dispose: () => {
      window.removeEventListener('popstate', synchronize);
    },
    /**
     * Creates an anchor that navigates without a page load on plain left clicks.
     *
     * @param props - The anchor props plus `to` and `replace`.
     * @returns The anchor component.
     */
    link: ({ to, replace, ...props }) =>
      tags.a({
        ...props,
        href: to.startsWith('/') ? base + to : to,
        'aria-current': computed(() =>
          location.value.path === (to.split(/[?#]/)[0] || '/') ? 'page' : null,
        ),
        /**
         * Runs the custom handler, then navigates unless the browser should handle the click
         * (modifier keys, other buttons, another target, a download or another origin).
         *
         * @param event - The click event.
         */
        onclick: (event: HTMLElementEventMap['click']) => {
          const custom = props.onclick;
          if (typeof custom === 'function') custom(event);
          else custom?.handler(event);
          const plain = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey);
          const own = !props.target || props.target === '_self';
          if (event.defaultPrevented || event.altKey || !plain || !own || props.download) return;
          if (!isInternal(to, base)) return;
          event.preventDefault();
          navigate(to, { replace });
        },
      } as never) as Component<'a'>,
    /**
     * Creates a component that renders the view of the current route and swaps it on navigation.
     *
     * @param props - Props for the outlet element.
     * @returns The outlet component.
     */
    outlet: (props = {}) => {
      let token = 0;
      return em.Outlet({
        ...props,
        /**
         * Follows the route while the outlet is in the document and renders its view.
         *
         * @param _ - The inner element, not used.
         * @param component - The outlet.
         * @returns A function that stops following the route and drops pending views.
         */
        mounted: (_: unknown, component: Component<'div'>) => {
          let rendered: string | undefined;
          const stop = effect(() => {
            const key = viewKey.value;
            if (key === rendered) return;
            rendered = key;
            const found = untracked(() => match.value);
            const view = found ? found.route.view : notFound;
            const context = untracked(() => ({
              ...location.value,
              params: found?.params ?? {},
              router,
            }));
            const own = ++token;
            const result = view ? untracked(() => view(context)) : undefined;
            /**
             * Renders a view, or nothing, into the outlet.
             *
             * @param node - The view.
             */
            const show = (node: Node | undefined) => {
              component.setState({ children: node ? [node] : [] });
            };
            if (isPromise(result)) {
              void result.then((node) => own === token && show(node));
            } else {
              show(result);
            }
          });
          return () => {
            stop();
            token++;
          };
        },
      } as never) as Component<'div'>;
    },
  };
  return router;
};
