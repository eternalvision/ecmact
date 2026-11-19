import { mount } from 'ecmact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSiteRouter, siteRoutes } from '@site/app/router';
import { docs } from '@site/content/docs/index';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(() => {
  vi.unstubAllEnvs();
  document.body.replaceChildren();
});

const open = (path: string) => {
  window.history.replaceState(null, '', path);
  const router = createSiteRouter();
  const outlet = router.outlet();
  mount(document.body, outlet);
  return { router, outlet };
};

describe('createSiteRouter', () => {
  it('shows the home page', () => {
    const { router, outlet } = open('/ecmact/');
    expect(outlet.querySelector('.hero')).not.toBeNull();
    router.dispose();
  });

  it('shows the examples', () => {
    const { router, outlet } = open('/ecmact/examples');
    expect(outlet.querySelector('h1')?.textContent).toBe('Examples');
    router.dispose();
  });

  it('shows the widget gallery', () => {
    const { router, outlet } = open('/ecmact/widgets');
    expect(outlet.querySelector('h1')?.textContent).toBe('Widgets');
    router.dispose();
  });

  it('shows a documentation page', () => {
    const { router, outlet } = open('/ecmact/docs/signals');
    expect(outlet.querySelector('article h1')?.textContent).toBe('Signals');
    router.dispose();
  });

  it('keeps the query and the hash through the redirect of /docs', async () => {
    const { router } = open('/ecmact/docs?lang=ru&x=1#top');
    await vi.waitFor(() => expect(router.location.value.path).toBe(`/docs/${docs[0]!.slug}`));
    expect(window.location.search).toBe('?lang=ru&x=1');
    expect(window.location.hash).toBe('#top');
    router.dispose();
  });

  it('redirects /docs to the first page', () => {
    const { router } = open('/ecmact/docs');
    expect(router.location.value.path).toBe(`/docs/${docs[0]!.slug}`);
    router.dispose();
  });

  it('shows not found for an unknown page and an unknown path', () => {
    const unknownDoc = open('/ecmact/docs/nope');
    expect(unknownDoc.outlet.querySelector('h1')?.textContent).toBe('Page not found');
    unknownDoc.router.dispose();
    document.body.replaceChildren();
    const unknown = open('/ecmact/elsewhere');
    expect(unknown.outlet.querySelector('h1')?.textContent).toBe('Page not found');
    unknown.router.dispose();
  });
});

describe('the links into the documentation under the base path', () => {
  it('opens an old link with a hash on the section it names', () => {
    const { router, outlet } = open('/ecmact/docs/signals#rules');
    expect(router.location.value.path).toBe('/docs/signals');
    expect(router.location.value.hash).toBe('#rules');
    expect(outlet.querySelector('#rules')?.textContent).toBe('Rules');
    expect(window.location.pathname + window.location.hash).toBe('/ecmact/docs/signals#rules');
    router.dispose();
  });

  it('shows the same page again when it is opened again, as a reload does', () => {
    const first = open('/ecmact/docs/signals#rules');
    first.router.dispose();
    document.body.replaceChildren();
    const second = open('/ecmact/docs/signals#rules');
    expect(second.outlet.querySelector('article h1')?.textContent).toBe('Signals');
    expect(second.outlet.querySelector('#rules')).not.toBeNull();
    second.router.dispose();
  });

  it('follows another article from the sidebar and comes back with Back', async () => {
    const { router, outlet } = open('/ecmact/docs/signals#rules');
    outlet.querySelector<HTMLAnchorElement>('.sidebar a[href$="/docs/styling"]')!.click();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/docs/styling'));
    expect(outlet.querySelector('article h1')?.textContent).toBe('Styling');
    window.history.back();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/docs/signals'));
    expect(router.location.value.hash).toBe('#rules');
    expect(outlet.querySelector('article h1')?.textContent).toBe('Signals');
    expect(window.location.pathname).toBe('/ecmact/docs/signals');
    router.dispose();
  });

  it('leads from an unknown article back to the documentation', async () => {
    const { router, outlet } = open('/ecmact/docs/nope');
    expect(outlet.querySelector('h1')?.textContent).toBe('Page not found');
    const back = outlet.querySelector<HTMLAnchorElement>('a[href="/ecmact/docs"]')!;
    expect(back.textContent).toBe('Read the docs');
    back.click();
    await vi.waitFor(() => expect(router.location.value.path).toBe(`/docs/${docs[0]!.slug}`));
    expect(window.location.pathname).toBe(`/ecmact/docs/${docs[0]!.slug}`);
    expect(outlet.querySelector('article h1')?.textContent).toBe('Getting started');
    router.dispose();
  });
});

describe('the atlas, a branch of the routes of the site, under the base path', () => {
  it('opens the island in the page of the atlas, and a place under it', async () => {
    const { router, outlet } = open('/ecmact/examples/atlas');
    expect(outlet.querySelector('h1')?.textContent).toBe('Pocket atlas');
    expect(outlet.querySelector('em-atlas')).not.toBeNull();
    expect(outlet.querySelector('.code-title')?.textContent).toBe('atlas.ts');
    const root = outlet.querySelector('em-atlas')!.shadowRoot!;
    expect(root.querySelector('a[aria-current="page"]')?.textContent).toBe('The whole island');
    root.querySelector<HTMLAnchorElement>('a[href="/ecmact/examples/atlas/saltmarsh"]')!.click();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/examples/atlas/saltmarsh'));
    expect(window.location.pathname).toBe('/ecmact/examples/atlas/saltmarsh');
    expect(outlet.querySelectorAll('h1')).toHaveLength(1);
    expect(outlet.querySelector('em-atlas')!.shadowRoot!.querySelector('h3')?.textContent).toBe(
      'Saltmarsh',
    );
    router.dispose();
  });

  it('opens a place with a layer again, as a reload does, and goes back to the gallery', async () => {
    const first = open('/ecmact/examples/atlas/saltmarsh?layer=tides');
    first.router.dispose();
    document.body.replaceChildren();
    const { router, outlet } = open('/ecmact/examples/atlas/saltmarsh?layer=tides');
    const root = outlet.querySelector('em-atlas')!.shadowRoot!;
    expect(root.querySelector('.addr')?.textContent).toBe('/examples/atlas/saltmarsh?layer=tides');
    expect(root.querySelector('a[aria-current="page"]')?.textContent).toBe('Saltmarsh');
    outlet.querySelector<HTMLAnchorElement>('.demo-back a')!.click();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/examples'));
    expect(outlet.querySelector('h1')?.textContent).toBe('Examples');
    window.history.back();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/examples/atlas/saltmarsh'));
    expect(outlet.querySelector('h1')?.textContent).toBe('Pocket atlas');
    router.dispose();
  });
});

describe('siteRoutes', () => {
  it('has a view for /docs that is only a fallback behind the redirect', () => {
    const { router, outlet } = open('/ecmact/');
    const route = siteRoutes(() => router).find((candidate) => candidate.path === '/docs')!;
    const context = { ...router.location.value, params: {}, router };
    const page = route.view(context) as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toBe('Page not found');
    expect(outlet).toBeDefined();
    router.dispose();
  });
});
