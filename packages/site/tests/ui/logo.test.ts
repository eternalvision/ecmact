import { afterEach, describe, expect, it } from 'vitest';
import { disposeRouters, makeRouter } from '@tests/helpers';
import { brand } from '@site/lib/brand';
import { lockup, Logo } from '@site/ui/logo';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('lockup', () => {
  it('draws the mark and the wordmark from the shared geometry in the text color', () => {
    const svg = lockup();
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${brand.lockupWidth} ${brand.height}`);
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    const paths = [...svg.querySelectorAll('path')];
    expect(paths.map((path) => path.getAttribute('d'))).toEqual([
      `${brand.block} ${brand.glyph}`,
      brand.wordFill,
      brand.wordStroke,
    ]);
    expect(paths[0]?.getAttribute('fill-rule')).toBe('evenodd');
    expect(paths[2]?.getAttribute('stroke')).toBe('currentColor');
    expect(svg.querySelector('g')?.getAttribute('transform')).toBe(
      `translate(${brand.wordOffset} 0)`,
    );
  });
});

describe('Logo', () => {
  it('is a link to the home page named by its label, with the lockup inside', () => {
    const router = makeRouter('/docs');
    const anchor = Logo(router);
    document.body.append(anchor);
    expect(anchor.localName).toBe('a');
    expect(anchor.getAttribute('aria-label')).toBe('ECMact, home');
    expect(anchor.className).toBe('logo');
    expect(anchor.querySelector('svg.logo-art')).not.toBeNull();
    expect(anchor.querySelector('img')).toBeNull();
    anchor.click();
    expect(router.location.value.path).toBe('/');
  });
});
