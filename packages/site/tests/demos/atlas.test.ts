import { createRouter, mount, type Router } from 'ecmact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { atlasRoute, create } from '@site/demos/atlas';

const routers: Router[] = [];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  routers.splice(0).forEach((router) => router.dispose());
  document.body.replaceChildren();
});

const open = async (path = '/examples/atlas') => {
  window.history.replaceState(null, '', `/ecmact${path}`);
  const router = createRouter({
    base: '/ecmact',
    routes: [
      { path: '/', view: () => document.createElement('p') },
      atlasRoute((stage) => {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.append(stage);
        return frame;
      }),
    ],
  });
  routers.push(router);
  mount(document.body, router.outlet());
  await vi.advanceTimersByTimeAsync(0);
  const root = () => document.querySelector('em-atlas')!.shadowRoot!;
  const link = (name: string) =>
    [...root().querySelectorAll<HTMLAnchorElement>('a')].find((item) => item.textContent === name)!;
  const address = () => root().querySelector('.addr')!.textContent;
  const sheet = () => root().querySelector<HTMLElement>('.sheet')!;
  const view = () => sheet().querySelector('h3')?.textContent;
  const night = () => root().querySelector<HTMLButtonElement>('.controls button')!;
  return { router, root, link, address, sheet, view, night };
};

describe('atlas example, as a branch of the routes', () => {
  it('opens at the island, with a link to every place and the current one marked', async () => {
    const { root, link, address, view } = await open();
    expect(root().host.parentElement?.className).toBe('frame');
    expect(address()).toBe('/examples/atlas');
    expect(view()).toBe('The whole island');
    expect(
      ['North Shoal', 'Saltmarsh', 'The Lighthouse'].map((name) => link(name).getAttribute('href')),
    ).toEqual([
      '/ecmact/examples/atlas/north-shoal',
      '/ecmact/examples/atlas/saltmarsh',
      '/ecmact/examples/atlas/lighthouse',
    ]);
    expect(link('The whole island').getAttribute('aria-current')).toBe('page');
    expect(link('Saltmarsh').hasAttribute('aria-current')).toBe(false);
  });

  it('opens a place, with its address, and marks the link as the current page', async () => {
    const { link, address, view, router } = await open();
    link('Saltmarsh').click();
    expect(router.location.value.path).toBe('/examples/atlas/saltmarsh');
    expect(address()).toBe('/examples/atlas/saltmarsh');
    expect(view()).toBe('Saltmarsh');
    expect(link('Saltmarsh').getAttribute('aria-current')).toBe('page');
    expect(link('The whole island').hasAttribute('aria-current')).toBe(false);
  });

  it('opens a place with a layer straight from its address, and falls back to the first layer for an unknown one', async () => {
    const first = await open('/examples/atlas/saltmarsh?layer=birds');
    expect(first.address()).toBe('/examples/atlas/saltmarsh?layer=birds');
    expect(first.sheet().querySelector('[aria-pressed="true"]')?.textContent).toBe('Birds');
    expect(first.sheet().textContent).toContain('Avocets');
    first.router.dispose();
    document.body.replaceChildren();
    const second = await open('/examples/atlas/saltmarsh?layer=zzz');
    expect(second.sheet().querySelector('[aria-pressed="true"]')?.textContent).toBe('Tides');
  });

  it('switches the layer in the query, keeps the focus on the button, and follows browser Back', async () => {
    const { router, root, address, sheet } = await open('/examples/atlas/saltmarsh');
    expect(sheet().querySelector('[aria-pressed="true"]')?.textContent).toBe('Tides');
    const birds = () => sheet().querySelector<HTMLButtonElement>('[data-layer="birds"]')!;
    birds().focus();
    birds().click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.query.get('layer')).toBe('birds');
    expect(address()).toBe('/examples/atlas/saltmarsh?layer=birds');
    expect(sheet().querySelector('[aria-pressed="true"]')?.textContent).toBe('Birds');
    expect(root().activeElement).toBe(birds());
    window.history.back();
    await vi.waitFor(() => expect(router.location.value.query.get('layer')).toBeNull());
    expect(address()).toBe('/examples/atlas/saltmarsh');
    expect(sheet().querySelector('[aria-pressed="true"]')?.textContent).toBe('Tides');
  });

  it('shows a waiting state while the lazy place loads, then the place', async () => {
    const { link, sheet, view } = await open();
    link('North Shoal').click();
    await vi.advanceTimersByTimeAsync(300);
    expect(sheet().getAttribute('aria-busy')).toBe('true');
    expect(sheet().querySelector<HTMLElement>('.waiting')?.hidden).toBe(false);
    expect(sheet().querySelector('.waiting')?.textContent).toBe(
      'Unrolling the sheet of North Shoal...',
    );
    await vi.advanceTimersByTimeAsync(500);
    expect(sheet().getAttribute('aria-busy')).toBe('false');
    expect(sheet().querySelector<HTMLElement>('.waiting')?.hidden).toBe(true);
    expect(view()).toBe('North Shoal');
    expect(link('North Shoal').getAttribute('aria-current')).toBe('page');
  });

  it('shows the waiting state when the lazy place is opened by its address', async () => {
    const { sheet, view } = await open('/examples/atlas/north-shoal');
    expect(sheet().getAttribute('aria-busy')).toBe('true');
    await vi.advanceTimersByTimeAsync(700);
    expect(view()).toBe('North Shoal');
  });

  it('forgets the lazy place when another one is opened before it has loaded', async () => {
    const { link, sheet, view } = await open();
    link('North Shoal').click();
    await vi.advanceTimersByTimeAsync(200);
    link('Saltmarsh').click();
    expect(sheet().getAttribute('aria-busy')).toBe('false');
    await vi.advanceTimersByTimeAsync(1000);
    expect(view()).toBe('Saltmarsh');
    expect(sheet().getAttribute('aria-busy')).toBe('false');
  });

  it('keeps the ticket of the newest sheet: an older lazy sheet that finishes does not end the wait', async () => {
    const { link, sheet } = await open();
    link('North Shoal').click();
    await vi.advanceTimersByTimeAsync(200);
    link('The whole island').click();
    link('North Shoal').click();
    await vi.advanceTimersByTimeAsync(500);
    expect(sheet().getAttribute('aria-busy')).toBe('true');
    await vi.advanceTimersByTimeAsync(300);
    expect(sheet().getAttribute('aria-busy')).toBe('false');
  });

  it('does not scroll the page to the top when a link of the map is followed, also through the guard', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const { link, router } = await open();
    link('Saltmarsh').click();
    link('The whole island').click();
    link('The Lighthouse').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.query.get('closed')).toBe('lighthouse');
    expect(scroll).not.toHaveBeenCalled();
    scroll.mockRestore();
  });

  it('leaves a click with a modifier key to the browser', async () => {
    const { link, router } = await open();
    link('Saltmarsh').dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.path).toBe('/examples/atlas');
  });

  it('sends the closed lighthouse back to the island, and lets a visitor in by day', async () => {
    const { link, router, view, sheet, night } = await open();
    expect(night().getAttribute('aria-pressed')).toBe('true');
    link('The Lighthouse').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.path).toBe('/examples/atlas');
    expect(router.location.value.query.get('closed')).toBe('lighthouse');
    expect(view()).toBe('The whole island');
    expect(sheet().querySelector('.notice')?.textContent).toBe(
      'The lighthouse is closed at night: the guard sent you back to the island.',
    );
    night().click();
    expect(night().getAttribute('aria-pressed')).toBe('false');
    link('The Lighthouse').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.path).toBe('/examples/atlas/lighthouse');
    expect(view()).toBe('The Lighthouse');
    expect(sheet().querySelector('.notice')).toBeNull();
  });

  it('sends a visitor who opens the lighthouse by its address to the island too', async () => {
    const { router, view } = await open('/examples/atlas/lighthouse');
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.path).toBe('/examples/atlas');
    expect(view()).toBe('The whole island');
  });

  it('shows its own not-found view for an unknown place, with a way back that keeps the focus on the sheet', async () => {
    const { link, sheet, view, router } = await open('/examples/atlas/zzz');
    expect(view()).toBe('No such place');
    expect(sheet().querySelector('.missing p')?.textContent).toBe(
      'The atlas has no sheet called "zzz".',
    );
    const back = sheet().querySelector<HTMLAnchorElement>('.missing a')!;
    back.focus();
    back.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(router.location.value.path).toBe('/examples/atlas');
    expect(view()).toBe('The whole island');
    expect(link('The whole island').getAttribute('aria-current')).toBe('page');
    expect(sheet().getRootNode()).toBeInstanceOf(ShadowRoot);
    expect((sheet().getRootNode() as ShadowRoot).activeElement).toBe(sheet());
  });

  it('does not take the name of an object property for a place', async () => {
    const { view } = await open('/examples/atlas/constructor');
    expect(view()).toBe('No such place');
  });
});

describe('atlas teaser', () => {
  it('shows the island and the address, and offers no links of its own', () => {
    const teaser = create();
    mount(document.body, teaser);
    const root = (teaser as HTMLElement).shadowRoot!;
    expect(root.querySelector('.addr')?.textContent).toBe('/examples/atlas');
    expect([...root.querySelectorAll('.place')].map((place) => place.textContent)).toEqual([
      'North Shoal',
      'Saltmarsh',
      'The Lighthouse',
    ]);
    expect(root.querySelector('a')).toBeNull();
  });

  it('shows the map alone when no frame is given', async () => {
    window.history.replaceState(null, '', '/examples/atlas');
    const router = createRouter({ routes: [atlasRoute()] });
    routers.push(router);
    mount(document.body, router.outlet());
    await vi.advanceTimersByTimeAsync(0);
    expect(document.querySelector('em-atlas')?.parentElement?.localName).toBe('router-outlet');
  });
});
