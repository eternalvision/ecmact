import { describe, expect, it } from 'vitest';
import { icon, slugify } from '@site/lib/dom';

describe('slugify', () => {
  it('lowers the case, joins words with dashes and drops everything else', () => {
    expect(slugify('Content and `children`')).toBe('content-and-children');
    expect(slugify('  --Hello, World!--  ')).toBe('hello-world');
    expect(slugify('???')).toBe('');
  });
});

describe('icon', () => {
  it('draws a stroke icon from path data', () => {
    const svg = icon(['M0 0h1', 'M1 1h1']);
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('path')).toHaveLength(2);
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M0 0h1');
  });
});
