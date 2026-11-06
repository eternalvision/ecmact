import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { start } from '@site/app/app';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(() => {
  vi.unstubAllEnvs();
  document.body.replaceChildren();
  delete document.documentElement.dataset.theme;
});

describe('start', () => {
  it('mounts the header, the page and the footer into the light DOM', () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(target.querySelector('header.site-header')).not.toBeNull();
    expect(target.querySelector('.outlet .hero')).not.toBeNull();
    expect(target.querySelector('footer.site-footer')).not.toBeNull();
    expect(document.title).toContain('ECMact');
    stop();
  });

  it('keeps the title in step with the page', async () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    const { router, stop } = start(target);
    await router.navigate('/docs/routing');
    expect(document.title).toBe('Routing - ECMact docs');
    expect(target.querySelector('article h1')?.textContent).toBe('Routing');
    stop();
  });

  it('can be mounted by selector, and stops following the router', async () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    target.id = 'app';
    document.body.append(target);
    const { router, stop } = start('#app');
    stop();
    await router.navigate('/examples');
    expect(document.title).toContain('ECMact');
  });
});
