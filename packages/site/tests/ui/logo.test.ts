import { afterEach, describe, expect, it } from 'vitest';
import { disposeRouters, makeRouter } from '@tests/helpers';
import { Logo } from '@site/ui/logo';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('Logo', () => {
  it('is a link to the home page with the logo image', () => {
    const router = makeRouter('/docs');
    const anchor = Logo(router);
    document.body.append(anchor);
    expect(anchor.localName).toBe('a');
    expect(anchor.getAttribute('aria-label')).toBe('ECMact, home');
    expect(anchor.className).toBe('logo');
    expect(anchor.querySelector('img')?.getAttribute('src')).toContain('ecmact-logo.png');
    anchor.click();
    expect(router.location.value.path).toBe('/');
  });
});
