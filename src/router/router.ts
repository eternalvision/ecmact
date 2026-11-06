import type { Component } from '@em/component';
import { em } from '@em/em';
import { matchPath, compilePattern } from '@em/router/match';
import { computed, effect, signal, untracked, type ReadonlySignal } from '@em/signals';
import { tags } from '@em/tags';
import type { ComponentProps } from '@em/types';

export interface RouterLocation {
  path: string;
  query: URLSearchParams;
  hash: string;
}

export interface RouteContext extends RouterLocation {
  params: Record<string, string>;
  router: Router;
}

type View = (context: RouteContext) => Node | Promise<Node>;

export interface Route {
  path: string;
  view: View;
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
}

export interface RouterOptions {
  routes: Route[];
  base?: string;
  notFound?: View;
}

export interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

export type LinkProps = Omit<ComponentProps<'a'>, 'tag' | 'href'> & {
  to: string;
  replace?: boolean;
};

export type OutletProps = Omit<ComponentProps<'div'>, 'tag' | 'children' | 'mounted'>;

export interface Router {
  readonly location: ReadonlySignal<RouterLocation>;
  readonly match: ReadonlySignal<RouteMatch | undefined>;
  navigate(to: string, options?: NavigateOptions): void;
  back(): void;
  forward(): void;
  link(props: LinkProps): Component<'a'>;
  outlet(props?: OutletProps): Component<'div'>;
  dispose(): void;
}

const stripBase = (pathname: string, base: string) =>
  base !== '' && (pathname === base || pathname.startsWith(`${base}/`))
    ? pathname.slice(base.length) || '/'
    : pathname;

const readLocation = (base: string): RouterLocation => ({
  path: stripBase(window.location.pathname, base),
  query: new URLSearchParams(window.location.search),
  hash: window.location.hash,
});

const isPromise = (value: unknown): value is Promise<Node> =>
  typeof (value as Promise<Node> | undefined)?.then === 'function';

const isInternal = (to: string, base: string) =>
  new URL(to.startsWith('/') ? base + to : to, window.location.href).origin ===
  window.location.origin;

export const createRouter = ({ routes, base: rawBase = '', notFound }: RouterOptions): Router => {
  const base = rawBase.replace(/\/+$/, '');
  const compiled = routes.map((route) => ({ route, pattern: compilePattern(route.path) }));
  const location = signal(readLocation(base));
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
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    dispose: () => window.removeEventListener('popstate', synchronize),
    link: ({ to, replace, ...props }) =>
      tags.a({
        ...props,
        href: to.startsWith('/') ? base + to : to,
        'aria-current': computed(() =>
          location.value.path === (to.split(/[?#]/)[0] || '/') ? 'page' : null,
        ),
        onclick: (event: HTMLElementEventMap['click']) => {
          props.onclick?.(event);
          const plain = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey);
          const own = !props.target || props.target === '_self';
          if (event.defaultPrevented || event.altKey || !plain || !own || props.download) return;
          if (!isInternal(to, base)) return;
          event.preventDefault();
          navigate(to, { replace });
        },
      } as never) as Component<'a'>,
    outlet: (props = {}) => {
      let token = 0;
      return em.Outlet({
        ...props,
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
            const show = (node: Node | undefined) =>
              component.setState({ children: node ? [node] : [] });
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
