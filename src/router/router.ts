import type { Component } from '@em/component';
import { em } from '@em/em';
import { createContext, consume, provide } from '@em/context';
import { flattenRoutes } from '@em/router/flatten';
import { runGuards } from '@em/router/guards';
import { compilePattern, matchPath } from '@em/router/match';
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

/**
 * What a guard decides: `true` or nothing to proceed, `false` to cancel, a path to redirect there instead.
 */
export type GuardResult = boolean | string | void;

/**
 * Runs before a navigation commits. It may be asynchronous.
 *
 * @param to - Where the navigation is going: the location, the matched parameters and the router.
 * @param from - The location the navigation starts from.
 * @returns The decision, or a promise of it.
 */
export type Guard = (to: RouteContext, from: RouterLocation) => GuardResult | Promise<GuardResult>;

/** Maps a path pattern to a view. */
export interface Route {
  /** The pattern: `/`, `/about`, `/users/:id`, `/files/*` or `*`. The first matching route wins. */
  path: string;
  /** Renders the route. For a route with `children` it renders the layout, which places the child with `router.outlet()`. */
  view: View;
  /** Routes shown inside this one. Their paths are relative to this route's path; a layout never matches alone. */
  children?: Route[];
  /** Runs before the router enters this route, after `beforeEach`. */
  beforeEnter?: Guard;
}

/** The route that matches the current path. */
export interface RouteMatch {
  /** The matched route: the innermost one for nested routes. */
  route: Route;
  /** The matched route and the layouts around it, outermost first. */
  routes: Route[];
  /** The decoded parameters, of the whole path. */
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
  /** Runs before every navigation, including the first one and back and forward. */
  beforeEach?: Guard;
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
   * @returns Whether the navigation happened: `false` if a guard cancelled it. Without async guards the location is
   * already updated when `navigate` returns.
   */
  navigate(to: string, options?: NavigateOptions): Promise<boolean>;
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
 * Reads the path, query and hash of a URL, relative to the base.
 *
 * @param url - The URL or `window.location`.
 * @param base - The base path without a trailing slash, or an empty string.
 * @returns The path, query and hash.
 */
const toLocation = (
  url: Pick<URL, 'pathname' | 'search' | 'hash'>,
  base: string,
): RouterLocation => ({
  path: stripBase(url.pathname, base),
  query: new URLSearchParams(url.search),
  hash: url.hash,
});

/**
 * Reads the current browser location, relative to the base.
 *
 * @param base - The base path without a trailing slash, or an empty string.
 * @returns The path, query and hash.
 */
const readLocation = (base: string) => toLocation(window.location, base);

/**
 * Tells whether a value is a promise.
 *
 * @template T - The type the promise resolves to.
 * @param value - A value or a promise of it.
 * @returns `true` for thenables.
 */
const isPromise = <T>(value: T | Promise<T>): value is Promise<T> =>
  typeof (value as Promise<T> | undefined)?.then === 'function';

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
export const createRouter = ({
  routes,
  base: rawBase = '',
  notFound,
  beforeEach,
}: RouterOptions): Router => {
  const base = rawBase.replace(/\/+$/, '');
  const flat = flattenRoutes(routes);
  const depthContext = createContext<{ depth: number }>('ecmact:router-depth');
  const ids = new Map<Route, number>();
  const location = signal(readLocation(base));
  let pending = 0;
  const maxRedirects = 10;

  /**
   * Finds the route that matches a path.
   *
   * @param path - The path without the base.
   * @returns The route entry and the parameters, or `undefined`.
   */
  const find = (path: string) => {
    for (const entry of flat) {
      const params = matchPath(entry.pattern, path);
      if (params) return { entry, params };
    }
    return undefined;
  };

  /**
   * Runs the guards that apply to a location.
   *
   * @param target - The location to enter.
   * @returns The decision, or a promise of it.
   */
  const check = (target: RouterLocation) => {
    const found = find(target.path);
    const guards = [
      ...(beforeEach ? [beforeEach] : []),
      ...(found?.entry.chain.flatMap((route) => route.beforeEnter ?? []) ?? []),
    ];
    if (guards.length === 0) return true;
    return runGuards(guards, { ...target, params: found?.params ?? {}, router }, location.value);
  };
  /**
   * Copies the browser location into the `location` signal.
   */
  const synchronize = () => {
    location.value = readLocation(base);
  };

  const current = computed(() => find(location.value.path));

  const match = computed<RouteMatch | undefined>(() => {
    const entry = current.value;
    if (!entry) return undefined;
    const { chain } = entry.entry;
    return { route: chain[chain.length - 1], routes: chain, params: entry.params };
  });

  const viewKey = computed(() => `${location.value.path}?${location.value.query.toString()}`);

  /**
   * Navigates to a path or URL. Urls on another origin are handed to the browser.
   * Navigating to the current url replaces the history entry instead of adding one.
   * Guards run first; a guard may cancel the navigation or redirect it.
   *
   * @param to - An app path starting with `/` (the base is added), or a URL.
   * @param options - Whether to replace the entry and whether to scroll to the top.
   * @param redirects - How many redirects led here, to stop a redirect loop.
   * @returns Whether the navigation happened.
   */
  const go = (
    to: string,
    { replace = false, scroll = true }: NavigateOptions,
    redirects: number,
  ): Promise<boolean> => {
    const url = new URL(to.startsWith('/') ? base + to : to, window.location.href);
    if (url.origin !== window.location.origin) {
      window.location.assign(url.href);
      return Promise.resolve(true);
    }
    const id = ++pending;
    /**
     * Applies the decision of the guards.
     *
     * @param decision - `true` to proceed, `false` to cancel, a path to redirect to.
     * @returns Whether the navigation happened.
     */
    const decide = (decision: boolean | string): Promise<boolean> => {
      if (id !== pending || decision === false) return Promise.resolve(false);
      if (typeof decision === 'string') {
        if (redirects >= maxRedirects) {
          throw new Error(
            `ecmact router: more than ${maxRedirects} redirects, the last one to "${decision}"`,
          );
        }
        return go(decision, { replace: true, scroll }, redirects + 1);
      }
      const target = url.pathname + url.search + url.hash;
      const now = window.location.pathname + window.location.search + window.location.hash;
      window.history[replace || target === now ? 'replaceState' : 'pushState'](null, '', target);
      synchronize();
      if (scroll) window.scrollTo(0, 0);
      return Promise.resolve(true);
    };
    const decision = check(toLocation(url, base));
    return isPromise(decision) ? decision.then(decide) : decide(decision);
  };

  /**
   * Navigates to a path or URL.
   *
   * @param to - An app path starting with `/` (the base is added), or a URL.
   * @param options - Whether to replace the entry and whether to scroll to the top.
   * @returns Whether the navigation happened.
   */
  const navigate = (to: string, options: NavigateOptions = {}) => go(to, options, 0);

  /**
   * Follows back and forward. The browser has already changed the URL, so a guard that cancels puts the old one back.
   */
  const onPopState = () => {
    const id = ++pending;
    /**
     * Applies the decision of the guards.
     *
     * @param decision - `true` to proceed, `false` to cancel, a path to redirect to.
     */
    const decide = (decision: boolean | string) => {
      if (id !== pending) return;
      if (decision === true) {
        synchronize();
      } else if (decision === false) {
        const { path, query, hash } = location.value;
        const search = query.toString();
        window.history.replaceState(null, '', `${base}${path}${search && `?${search}`}${hash}`);
      } else {
        void go(decision, { replace: true }, 1);
      }
    };
    const decision = check(readLocation(base));
    if (isPromise(decision)) void decision.then(decide);
    else decide(decision);
  };

  window.addEventListener('popstate', onPopState);

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
      window.removeEventListener('popstate', onPopState);
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
      const level = { depth: 0 };
      return em.Outlet({
        ...props,
        provide: [provide(depthContext, level)],
        /**
         * Follows the route while the outlet is in the document and renders its view.
         * An outlet inside a layout renders the next route of the chain.
         *
         * @param _ - The inner element, not used.
         * @param component - The outlet.
         * @returns A function that stops following the route and drops pending views.
         */
        mounted: (_: unknown, component: Component<'div'>) => {
          const parent = consume(depthContext, component);
          level.depth = parent ? parent.depth + 1 : 0;
          let rendered: string | undefined;
          const stop = effect(() => {
            const entry = current.value;
            const { depth } = level;
            const route = entry?.entry.chain[depth];
            let key = `${viewKey.value}`;
            if (entry && route) {
              if (!ids.has(route)) ids.set(route, ids.size);
              const names = compilePattern(entry.entry.paths[depth]).names;
              const own = names.map((name) => entry.params[name]).join('\0');
              const last = depth === entry.entry.chain.length - 1;
              key = `${ids.get(route)}|${own}|${last ? viewKey.value : ''}`;
            } else if (entry) {
              key = 'none';
            }
            if (key === rendered) return;
            rendered = key;
            const view = entry ? route?.view : notFound;
            const context = untracked(() => ({
              ...location.value,
              params: entry?.params ?? {},
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

  const initial = check(location.value);
  /**
   * Follows a redirect from a guard of the first location. Cancelling has no effect there: there is nowhere to go back to.
   *
   * @param decision - The decision of the guards.
   */
  const settle = (decision: boolean | string) => {
    if (typeof decision === 'string') void go(decision, { replace: true, scroll: false }, 1);
  };
  if (isPromise(initial)) void initial.then(settle);
  else settle(initial);

  return router;
};
