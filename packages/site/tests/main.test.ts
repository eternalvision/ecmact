import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  document.body.replaceChildren();
});

describe('main', () => {
  it('starts the site in #app', async () => {
    window.history.replaceState(null, '', '/ecmact/');
    document.body.innerHTML = '<div id="app"></div>';
    await import('@site/main');
    expect(document.querySelector('#app header.site-header')).not.toBeNull();
  });
});
