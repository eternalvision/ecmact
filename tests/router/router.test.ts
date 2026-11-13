import { afterEach, beforeEach, describe, expect, inject, it, vi, type MockInstance } from 'vitest';
import {
  createRouter,
  type RouteContext,
  type Router,
  type RouterOptions,
} from '@em/router/router';
import { leavePage } from '@em/utils/env';

vi.mock('@em/utils/env', { spy: true });

const created: Router[] = [];

const make = (options: RouterOptions) => {
  const router = createRouter(options);
  created.push(router);
  return router;
};

const page = (text: string) => {
  const element = document.createElement('p');
  element.textContent = text;
  return element;
};

const flush = () => new Promise((done) => setTimeout(done, 0));

const click = (target: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  const stop = (nativeEvent: Event) => nativeEvent.preventDefault();
  document.addEventListener('click', stop);
  target.dispatchEvent(event);
  document.removeEventListener('click', stop);
  return event;
};

/** WebKit throws after 100 calls of `pushState` and `replaceState` by one page in 10 seconds. */
const historyLimit = { calls: 90, span: 10_000 };
/** The times of the history calls of this file, for the limit of WebKit. */
const historyCalls: number[] = [];
let pushState: MockInstance<History['pushState']>;
let replaceState: MockInstance<History['replaceState']>;

/**
 * In WebKit, waits until the next test cannot exceed the limit of history calls: 10 seconds after the last
 * call, when the page has made close to 100 calls since its count started.
 */
const historyBudget = async () => {
  const now = Date.now();
  const recent = historyCalls.filter((time) => now - time < historyLimit.span);
  if (inject('engine') !== 'webkit' || recent.length < historyLimit.calls) return;
  await new Promise((done) =>
    setTimeout(done, recent[recent.length - 1] + historyLimit.span - now),
  );
  historyCalls.splice(0);
};

beforeEach(async () => {
  await historyBudget();
  if (window.location.pathname + window.location.search + window.location.hash !== '/') {
    window.history.replaceState(null, '', '/');
    historyCalls.push(Date.now());
  }
  pushState = vi.spyOn(window.history, 'pushState');
  replaceState = vi.spyOn(window.history, 'replaceState');
}, 15_000);

afterEach(() => {
  const count = pushState.mock.calls.length + replaceState.mock.calls.length;
  historyCalls.push(...Array.from({ length: count }, () => Date.now()));
  created.splice(0).forEach((router) => router.dispose());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('location', () => {
  it('reads the path, query and hash', () => {
    window.history.replaceState(null, '', '/users/1?tab=posts#top');
    const router = make({ routes: [] });
    expect(router.location.value.path).toBe('/users/1');
    expect(router.location.value.query.get('tab')).toBe('posts');
    expect(router.location.value.hash).toBe('#top');
  });

  it('removes the base from the path', () => {
    window.history.replaceState(null, '', '/app/users/1');
    expect(make({ routes: [], base: '/app' }).location.value.path).toBe('/users/1');
  });

  it('trims any number of trailing slashes from the base, and stays fast', () => {
    window.history.replaceState(null, '', '/app/users/1');
    const started = Date.now();
    const router = make({ routes: [], base: `/app${'/'.repeat(50000)}` });
    expect(router.location.value.path).toBe('/users/1');
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('stays fast when a long run of slashes is not at the end of the base', () => {
    window.history.replaceState(null, '', '/other');
    const started = Date.now();
    make({ routes: [], base: `${'/'.repeat(100000)}x` });
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('maps the base itself to the root', () => {
    window.history.replaceState(null, '', '/app');
    expect(make({ routes: [], base: '/app/' }).location.value.path).toBe('/');
  });

  it('keeps paths outside the base as they are', () => {
    window.history.replaceState(null, '', '/other');
    expect(make({ routes: [], base: '/app' }).location.value.path).toBe('/other');
  });

  it('follows popstate events', () => {
    const router = make({ routes: [] });
    window.history.pushState(null, '', '/back');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(router.location.value.path).toBe('/back');
  });

  it('stops following popstate after dispose', () => {
    const router = make({ routes: [] });
    router.dispose();
    window.history.pushState(null, '', '/ignored');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(router.location.value.path).toBe('/');
  });
});

describe('navigate', () => {
  it('pushes a history entry and updates the location', () => {
    const router = make({ routes: [] });
    router.navigate('/users/2?tab=a#x');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/users/2?tab=a#x',
    );
    expect(pushState).toHaveBeenCalledTimes(1);
    expect(replaceState).not.toHaveBeenCalled();
    expect(router.location.value.path).toBe('/users/2');
    expect(router.location.value.query.get('tab')).toBe('a');
    expect(router.location.value.hash).toBe('#x');
  });

  it('replaces the entry when asked to', () => {
    const router = make({ routes: [] });
    router.navigate('/replaced', { replace: true });
    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/replaced');
  });

  it('replaces the entry when the url does not change', () => {
    const router = make({ routes: [] });
    router.navigate('/same');
    expect(pushState).toHaveBeenCalledTimes(1);
    router.navigate('/same');
    expect(pushState).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledTimes(1);
  });

  it('prefixes absolute paths with the base', () => {
    const router = make({ routes: [], base: '/app' });
    router.navigate('/users/3');
    expect(window.location.pathname).toBe('/app/users/3');
    expect(router.location.value.path).toBe('/users/3');
  });

  it('resolves relative targets against the current url', () => {
    const router = make({ routes: [] });
    router.navigate('/a/b');
    router.navigate('c');
    expect(window.location.pathname).toBe('/a/c');
  });

  it('hands other origins to the browser', () => {
    const router = make({ routes: [] });
    vi.mocked(leavePage).mockImplementationOnce(() => {});
    router.navigate('https://example.com/x');
    expect(leavePage).toHaveBeenCalledWith('https://example.com/x');
  });

  it('scrolls to the top by default and can skip it', () => {
    const router = make({ routes: [] });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    router.navigate('/one');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    router.navigate('/two', { scroll: false });
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('goes back and forward through the history', () => {
    const router = make({ routes: [] });
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const forward = vi.spyOn(window.history, 'forward').mockImplementation(() => {});
    router.back();
    router.forward();
    expect(back).toHaveBeenCalledTimes(1);
    expect(forward).toHaveBeenCalledTimes(1);
  });
});

describe('match', () => {
  const routes = [
    { path: '/users/new', view: () => page('new') },
    { path: '/users/:id', view: () => page('user') },
    { path: '*', view: () => page('fallback') },
  ];

  it('picks the first route that matches', () => {
    const router = make({ routes });
    router.navigate('/users/new');
    expect(router.match.value?.route).toBe(routes[0]);
    router.navigate('/users/7');
    expect(router.match.value?.route).toBe(routes[1]);
    expect(router.match.value?.params).toEqual({ id: '7' });
  });

  it('is undefined when nothing matches', () => {
    const router = make({ routes: [{ path: '/only', view: () => page('only') }] });
    expect(router.match.value).toBeUndefined();
  });
});

describe('outlet', () => {
  it('renders the view of the current route', () => {
    const router = make({ routes: [{ path: '/', view: () => page('home') }] });
    const outlet = router.outlet();
    document.body.append(outlet);
    expect(outlet.textContent).toBe('home');
  });

  it('passes the context to the view', () => {
    window.history.replaceState(null, '', '/users/9?tab=a#top');
    const view = vi.fn((_context: RouteContext) => page('user'));
    const router = make({ routes: [{ path: '/users/:id', view }] });
    document.body.append(router.outlet());
    const context = view.mock.calls[0]![0];
    expect(context.path).toBe('/users/9');
    expect(context.params).toEqual({ id: '9' });
    expect(context.query.get('tab')).toBe('a');
    expect(context.hash).toBe('#top');
    expect(context.router).toBe(router);
  });

  it('switches views on navigation', () => {
    const router = make({
      routes: [
        { path: '/', view: () => page('home') },
        { path: '/about', view: () => page('about') },
      ],
    });
    const outlet = router.outlet();
    document.body.append(outlet);
    router.navigate('/about');
    expect(outlet.textContent).toBe('about');
  });

  it('re-renders when only the query changes, not when only the hash changes', () => {
    const view = vi.fn(() => page('x'));
    const router = make({ routes: [{ path: '/', view }] });
    document.body.append(router.outlet());
    router.navigate('/#section');
    expect(view).toHaveBeenCalledTimes(1);
    router.navigate('/?page=2');
    expect(view).toHaveBeenCalledTimes(2);
  });

  it('uses notFound when no route matches', () => {
    const router = make({
      routes: [{ path: '/', view: () => page('home') }],
      notFound: ({ path }) => page(`missing ${path}`),
    });
    const outlet = router.outlet();
    document.body.append(outlet);
    router.navigate('/nope');
    expect(outlet.textContent).toBe('missing /nope');
  });

  it('renders nothing when no route matches and there is no notFound', () => {
    const router = make({ routes: [{ path: '/', view: () => page('home') }] });
    const outlet = router.outlet();
    document.body.append(outlet);
    router.navigate('/nope');
    expect(outlet.children).toHaveLength(0);
  });

  it('renders asynchronous views when they resolve', async () => {
    const router = make({ routes: [{ path: '/', view: async () => page('lazy') }] });
    const outlet = router.outlet();
    document.body.append(outlet);
    expect(outlet.textContent).toBe('');
    await flush();
    expect(outlet.textContent).toBe('lazy');
  });

  it('ignores an asynchronous view that resolves after the route changed', async () => {
    let finish!: (node: Node) => void;
    const router = make({
      routes: [
        { path: '/slow', view: () => new Promise<Node>((done) => (finish = done)) },
        { path: '/fast', view: () => page('fast') },
      ],
    });
    router.navigate('/slow');
    const outlet = router.outlet();
    document.body.append(outlet);
    router.navigate('/fast');
    finish(page('slow'));
    await flush();
    expect(outlet.textContent).toBe('fast');
  });

  it('does not render a pending view after the outlet is removed', async () => {
    let finish!: (node: Node) => void;
    const router = make({
      routes: [{ path: '/', view: () => new Promise<Node>((done) => (finish = done)) }],
    });
    const outlet = router.outlet();
    document.body.append(outlet);
    outlet.remove();
    finish(page('late'));
    await flush();
    expect(outlet.textContent).toBe('');
  });

  it('does not depend on the signals read inside a view', () => {
    const view = vi.fn(() => page('x'));
    const router = make({ routes: [{ path: '/', view }] });
    document.body.append(router.outlet());
    router.location.peek();
    expect(view).toHaveBeenCalledTimes(1);
  });

  it('stops following the router once removed', () => {
    const view = vi.fn(() => page('x'));
    const router = make({
      routes: [
        { path: '/', view },
        { path: '/b', view },
      ],
    });
    const outlet = router.outlet();
    document.body.append(outlet);
    outlet.remove();
    router.navigate('/b');
    expect(view).toHaveBeenCalledTimes(1);
  });

  it('passes props to the outlet element', () => {
    const router = make({ routes: [] });
    expect(router.outlet({ class: 'view' }).className).toBe('view');
  });
});

describe('link', () => {
  const routes = [
    { path: '/', view: () => page('home') },
    { path: '/about', view: () => page('about') },
  ];

  it('renders an anchor with the target as href', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' }, 'About');
    expect(link.localName).toBe('a');
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.textContent).toBe('About');
  });

  it('prefixes the href with the base', () => {
    const router = make({ routes, base: '/app' });
    expect(router.link({ to: '/about' }).getAttribute('href')).toBe('/app/about');
  });

  it('keeps relative and absolute urls as written', () => {
    const router = make({ routes });
    expect(router.link({ to: 'https://example.com' }).getAttribute('href')).toBe(
      'https://example.com',
    );
  });

  it('navigates on a plain click', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' });
    document.body.append(link);
    const event = click(link);
    expect(event.defaultPrevented).toBe(true);
    expect(router.location.value.path).toBe('/about');
  });

  it('replaces the entry when asked to', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about', replace: true });
    document.body.append(link);
    click(link);
    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(router.location.value.path).toBe('/about');
  });

  it('leaves clicks with modifiers to the browser', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' });
    document.body.append(link);
    for (const init of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
    ]) {
      click(link, init);
    }
    click(link, { button: 1 });
    expect(router.location.value.path).toBe('/');
  });

  it('leaves links with another target or a download alone', () => {
    const router = make({ routes });
    const blank = router.link({ to: '/about', target: '_blank' });
    const download = router.link({ to: '/about', download: true });
    document.body.append(blank, download);
    click(blank);
    click(download);
    expect(router.location.value.path).toBe('/');
  });

  it('intercepts links with target _self', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about', target: '_self' });
    document.body.append(link);
    click(link);
    expect(router.location.value.path).toBe('/about');
  });

  it('leaves links to other origins alone', () => {
    const router = make({ routes });
    const link = router.link({ to: 'https://example.com/x' });
    document.body.append(link);
    click(link);
    expect(router.location.value.path).toBe('/');
  });

  it('runs a custom onclick first and respects preventDefault', () => {
    const router = make({ routes });
    const onclick = vi.fn((event: Event) => event.preventDefault());
    const link = router.link({ to: '/about', onclick });
    document.body.append(link);
    click(link);
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(router.location.value.path).toBe('/');
  });

  it('accepts a custom onclick given with options', () => {
    const router = make({ routes });
    const handler = vi.fn((event: Event) => event.preventDefault());
    const link = router.link({ to: '/about', onclick: { handler } });
    document.body.append(link);
    click(link);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(router.location.value.path).toBe('/');
  });

  it('works without a custom onclick', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' });
    document.body.append(link);
    expect(() => click(link)).not.toThrow();
  });

  it('marks the current page with aria-current', () => {
    const router = make({ routes });
    const home = router.link({ to: '/' });
    const about = router.link({ to: '/about?x=1#y' });
    document.body.append(home, about);
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(about.hasAttribute('aria-current')).toBe(false);
    router.navigate('/about');
    expect(home.hasAttribute('aria-current')).toBe(false);
    expect(about.getAttribute('aria-current')).toBe('page');
  });

  it('treats an empty path as the root for aria-current', () => {
    const router = make({ routes });
    const link = router.link({ to: '?tab=1' });
    document.body.append(link);
    expect(link.getAttribute('aria-current')).toBe('page');
  });
});

describe('guards', () => {
  const routes = [
    { path: '/', view: () => page('home') },
    { path: '/about', view: () => page('about') },
    { path: '/login', view: () => page('login') },
  ];

  it('runs beforeEach before navigating and can cancel', async () => {
    const beforeEach = vi.fn(() => false);
    const router = make({ routes, beforeEach });
    expect(await router.navigate('/about')).toBe(false);
    expect(router.location.value.path).toBe('/');
    expect(window.location.pathname).toBe('/');
  });

  it('passes the destination, with its parameters, and the origin', async () => {
    const seen: [string, Record<string, string>, string][] = [];
    const router = make({
      routes: [{ path: '/users/:id', view: () => page('user') }, ...routes],
      beforeEach: (to, from) => {
        seen.push([to.path, to.params, from.path]);
      },
    });
    await router.navigate('/users/7');
    expect(seen).toContainEqual(['/users/7', { id: '7' }, '/']);
  });

  it('completes a navigation without async guards before it returns', () => {
    const router = make({ routes, beforeEach: () => true });
    void router.navigate('/about');
    expect(router.location.value.path).toBe('/about');
  });

  it('runs beforeEnter of the matched route, and of its layouts, after beforeEach', async () => {
    const order: string[] = [];
    const router = make({
      routes: [
        {
          path: '/admin',
          view: () => page('admin'),
          beforeEnter: () => {
            order.push('layout');
          },
          children: [
            {
              path: 'users',
              view: () => page('users'),
              beforeEnter: () => {
                order.push('leaf');
              },
            },
          ],
        },
      ],
      beforeEach: () => {
        order.push('each');
      },
    });
    order.length = 0;
    await router.navigate('/admin/users');
    expect(order).toEqual(['each', 'layout', 'leaf']);
  });

  it('redirects with a path, replacing the entry', async () => {
    const router = make({
      routes: [
        { path: '/', view: () => page('home') },
        { path: '/private', view: () => page('private'), beforeEnter: () => '/login' },
        { path: '/login', view: () => page('login') },
      ],
    });
    expect(await router.navigate('/private')).toBe(true);
    expect(router.location.value.path).toBe('/login');
    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).toHaveBeenCalledTimes(1);
  });

  it('waits for async guards', async () => {
    const router = make({
      routes,
      beforeEach: async (to) => {
        await flush();
        return to.path !== '/about';
      },
    });
    const result = router.navigate('/about');
    expect(router.location.value.path).toBe('/');
    expect(await result).toBe(false);
    expect(await router.navigate('/login')).toBe(true);
    expect(router.location.value.path).toBe('/login');
  });

  it('drops a navigation that a newer one overtook', async () => {
    const router = make({
      routes,
      beforeEach: async (to) => {
        if (to.path === '/about') await flush();
      },
    });
    const slow = router.navigate('/about');
    const fast = router.navigate('/login');
    expect(await fast).toBe(true);
    expect(await slow).toBe(false);
    expect(router.location.value.path).toBe('/login');
  });

  it('throws on a redirect loop', () => {
    const router = make({
      routes: [{ path: '/a', view: () => page('a') }, ...routes],
      beforeEach: (to) => (to.path === '/a' ? '/b' : to.path === '/b' ? '/a' : undefined),
    });
    expect(() => router.navigate('/a')).toThrow(/redirects/);
  });

  it('guards the first location and follows its redirect', () => {
    window.history.replaceState(null, '', '/private');
    const router = make({
      routes: [
        { path: '/private', view: () => page('private'), beforeEnter: () => '/login' },
        { path: '/login', view: () => page('login') },
      ],
    });
    expect(router.location.value.path).toBe('/login');
  });

  it('follows the redirect of an async guard of the first location', async () => {
    window.history.replaceState(null, '', '/private');
    const router = make({
      routes: [
        { path: '/private', view: () => page('private') },
        { path: '/login', view: () => page('login') },
      ],
      beforeEach: async (to) => (to.path === '/private' ? '/login' : undefined),
    });
    await flush();
    expect(router.location.value.path).toBe('/login');
  });

  it('ignores a cancel of the first location', () => {
    window.history.replaceState(null, '', '/about');
    const router = make({ routes, beforeEach: () => false });
    expect(router.location.value.path).toBe('/about');
  });

  it('guards back and forward and restores the old url when cancelled', () => {
    const router = make({ routes, beforeEach: (to) => to.path !== '/about' });
    window.history.replaceState(null, '', '/about?x=1#y');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(router.location.value.path).toBe('/');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/');
  });

  it('restores the url with the base and the query of the location', () => {
    window.history.replaceState(null, '', '/app/login?a=1#h');
    const router = make({
      routes,
      base: '/app',
      beforeEach: (to) => to.path !== '/about',
    });
    window.history.replaceState(null, '', '/app/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/app/login?a=1#h',
    );
    expect(router.location.value.path).toBe('/login');
  });

  it('redirects from a guard on back and forward', () => {
    const router = make({
      routes,
      beforeEach: (to) => (to.path === '/about' ? '/login' : undefined),
    });
    window.history.replaceState(null, '', '/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(router.location.value.path).toBe('/login');
  });

  it('waits for async guards on back and forward, and ignores stale ones', async () => {
    const router = make({
      routes,
      beforeEach: async (to) => {
        await flush();
        return to.path !== '/login';
      },
    });
    window.history.replaceState(null, '', '/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.history.replaceState(null, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flush();
    await flush();
    expect(router.location.value.path).toBe('/');
  });
});

describe('nested routes', () => {
  const build = () => {
    const calls = { layout: 0, index: 0, detail: 0 };
    const router = make({
      routes: [
        {
          path: '/users',
          view: () => {
            calls.layout++;
            const wrapper = document.createElement('section');
            wrapper.append(page('layout'), router.outlet({ id: 'inner' }));
            return wrapper;
          },
          children: [
            {
              path: '',
              view: () => {
                calls.index++;
                return page('list');
              },
            },
            {
              path: ':id',
              view: ({ params }) => {
                calls.detail++;
                return page(`user ${params.id}`);
              },
            },
          ],
        },
        { path: '/other', view: () => page('other') },
      ],
      notFound: () => page('missing'),
    });
    return { router, calls };
  };

  const text = (outlet: Element) => outlet.textContent;

  it('renders the layout and the child in a nested outlet', async () => {
    const { router } = build();
    window.history.replaceState(null, '', '/users/5');
    router.navigate('/users/5');
    const outlet = router.outlet();
    document.body.append(outlet);
    await flush();
    expect(text(outlet)).toContain('layout');
    const nested = outlet.querySelector('section')!.lastElementChild!;
    expect(nested.textContent).toBe('user 5');
  });

  it('keeps the layout while the child changes', async () => {
    const { router, calls } = build();
    const outlet = router.outlet();
    document.body.append(outlet);
    await router.navigate('/users');
    await router.navigate('/users/1');
    await router.navigate('/users/2');
    expect(calls.layout).toBe(1);
    expect(calls.index).toBe(1);
    expect(calls.detail).toBe(2);
    const nested = outlet.querySelector('section')!.lastElementChild!;
    expect(nested.textContent).toBe('user 2');
  });

  it('rebuilds the layout when the route outside it changes', async () => {
    const { router, calls } = build();
    const outlet = router.outlet();
    document.body.append(outlet);
    await router.navigate('/users');
    await router.navigate('/other');
    await router.navigate('/users');
    expect(calls.layout).toBe(2);
    expect(text(outlet)).toContain('layout');
  });

  it('rebuilds a layout whose own parameters changed and keeps one whose did not', async () => {
    const calls = { layout: 0 };
    const router = make({
      routes: [
        {
          path: '/teams/:team',
          view: () => {
            calls.layout++;
            return router.outlet();
          },
          children: [{ path: 'members/:member', view: () => page('member') }],
        },
      ],
    });
    document.body.append(router.outlet());
    await router.navigate('/teams/a/members/1');
    await router.navigate('/teams/a/members/2');
    expect(calls.layout).toBe(1);
    await router.navigate('/teams/b/members/2');
    expect(calls.layout).toBe(2);
  });

  it('renders nothing in an outlet deeper than the matched chain', async () => {
    const router = make({
      routes: [{ path: '/', view: () => router.outlet() }],
      notFound: () => page('missing'),
    });
    const outlet = router.outlet();
    document.body.append(outlet);
    await flush();
    const nested = outlet.firstElementChild!;
    expect(nested.children).toHaveLength(0);
  });

  it('exposes the chain in match', async () => {
    const { router } = build();
    await router.navigate('/users/3');
    const match = router.match.value!;
    expect(match.routes).toHaveLength(2);
    expect(match.route).toBe(match.routes[1]);
    expect(match.params).toEqual({ id: '3' });
  });

  it('shows notFound when no route matches', async () => {
    const { router } = build();
    const outlet = router.outlet();
    document.body.append(outlet);
    await router.navigate('/nowhere');
    expect(text(outlet)).toBe('missing');
  });
});
