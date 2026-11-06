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
  const outlet = router.outlet({ shadow: false });
  document.body.append(outlet);
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

  it('shows a documentation page', () => {
    const { router, outlet } = open('/ecmact/docs/signals');
    expect(outlet.querySelector('article h1')?.textContent).toBe('Signals');
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
