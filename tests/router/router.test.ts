import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRouter,
  type RouteContext,
  type Router,
  type RouterOptions,
} from '@em/router/router';
import { inner } from '@tests/helpers';

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

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
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
    const length = window.history.length;
    router.navigate('/users/2?tab=a#x');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/users/2?tab=a#x',
    );
    expect(window.history.length).toBe(length + 1);
    expect(router.location.value.path).toBe('/users/2');
    expect(router.location.value.query.get('tab')).toBe('a');
    expect(router.location.value.hash).toBe('#x');
  });

  it('replaces the entry when asked to', () => {
    const router = make({ routes: [] });
    const length = window.history.length;
    router.navigate('/replaced', { replace: true });
    expect(window.history.length).toBe(length);
    expect(window.location.pathname).toBe('/replaced');
  });

  it('replaces the entry when the url does not change', () => {
    const router = make({ routes: [] });
    router.navigate('/same');
    const length = window.history.length;
    router.navigate('/same');
    expect(window.history.length).toBe(length);
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
    const assign = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign,
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
    } as Location);
    router.navigate('https://example.com/x');
    expect(assign).toHaveBeenCalledWith('https://example.com/x');
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
    expect(inner(outlet).textContent).toBe('home');
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
    expect(inner(outlet).textContent).toBe('about');
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
    expect(inner(outlet).textContent).toBe('missing /nope');
  });

  it('renders nothing when no route matches and there is no notFound', () => {
    const router = make({ routes: [{ path: '/', view: () => page('home') }] });
    const outlet = router.outlet();
    document.body.append(outlet);
    router.navigate('/nope');
    expect(inner(outlet).childNodes).toHaveLength(0);
  });

  it('renders asynchronous views when they resolve', async () => {
    const router = make({ routes: [{ path: '/', view: async () => page('lazy') }] });
    const outlet = router.outlet();
    document.body.append(outlet);
    expect(inner(outlet).textContent).toBe('');
    await flush();
    expect(inner(outlet).textContent).toBe('lazy');
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
    expect(inner(outlet).textContent).toBe('fast');
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
    expect(inner(outlet).textContent).toBe('');
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
    expect(inner(router.outlet({ class: 'view' })).className).toBe('view');
  });
});

describe('link', () => {
  const routes = [
    { path: '/', view: () => page('home') },
    { path: '/about', view: () => page('about') },
  ];

  it('renders an anchor with the target as href', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about', content: 'About' });
    expect(inner(link).localName).toBe('a');
    expect(inner(link).getAttribute('href')).toBe('/about');
    expect(inner(link).textContent).toBe('About');
  });

  it('prefixes the href with the base', () => {
    const router = make({ routes, base: '/app' });
    expect(inner(router.link({ to: '/about' })).getAttribute('href')).toBe('/app/about');
  });

  it('keeps relative and absolute urls as written', () => {
    const router = make({ routes });
    expect(inner(router.link({ to: 'https://example.com' })).getAttribute('href')).toBe(
      'https://example.com',
    );
  });

  it('navigates on a plain click', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' });
    document.body.append(link);
    const event = click(inner(link));
    expect(event.defaultPrevented).toBe(true);
    expect(router.location.value.path).toBe('/about');
  });

  it('replaces the entry when asked to', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about', replace: true });
    document.body.append(link);
    const length = window.history.length;
    click(inner(link));
    expect(window.history.length).toBe(length);
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
      click(inner(link), init);
    }
    click(inner(link), { button: 1 });
    expect(router.location.value.path).toBe('/');
  });

  it('leaves links with another target or a download alone', () => {
    const router = make({ routes });
    const blank = router.link({ to: '/about', target: '_blank' });
    const download = router.link({ to: '/about', download: true });
    document.body.append(blank, download);
    click(inner(blank));
    click(inner(download));
    expect(router.location.value.path).toBe('/');
  });

  it('intercepts links with target _self', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about', target: '_self' });
    document.body.append(link);
    click(inner(link));
    expect(router.location.value.path).toBe('/about');
  });

  it('leaves links to other origins alone', () => {
    const router = make({ routes });
    const link = router.link({ to: 'https://example.com/x' });
    document.body.append(link);
    click(inner(link));
    expect(router.location.value.path).toBe('/');
  });

  it('runs a custom onclick first and respects preventDefault', () => {
    const router = make({ routes });
    const onclick = vi.fn((event: Event) => event.preventDefault());
    const link = router.link({ to: '/about', onclick });
    document.body.append(link);
    click(inner(link));
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(router.location.value.path).toBe('/');
  });

  it('works without a custom onclick', () => {
    const router = make({ routes });
    const link = router.link({ to: '/about' });
    document.body.append(link);
    expect(() => click(inner(link))).not.toThrow();
  });

  it('marks the current page with aria-current', () => {
    const router = make({ routes });
    const home = router.link({ to: '/' });
    const about = router.link({ to: '/about?x=1#y' });
    document.body.append(home, about);
    expect(inner(home).getAttribute('aria-current')).toBe('page');
    expect(inner(about).hasAttribute('aria-current')).toBe(false);
    router.navigate('/about');
    expect(inner(home).hasAttribute('aria-current')).toBe(false);
    expect(inner(about).getAttribute('aria-current')).toBe('page');
  });

  it('treats an empty path as the root for aria-current', () => {
    const router = make({ routes });
    const link = router.link({ to: '?tab=1' });
    document.body.append(link);
    expect(inner(link).getAttribute('aria-current')).toBe('page');
  });
});
