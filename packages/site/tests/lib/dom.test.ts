import { describe, expect, it } from 'vitest';
import { el, icon, slugify } from '@site/lib/dom';

describe('el', () => {
  it('creates an element with a class, attributes and children', () => {
    const element = el(
      'a',
      { class: 'link', attrs: { href: '/x', hidden: true, title: undefined, id: false } },
      'text',
      el('b'),
    );
    expect(element.localName).toBe('a');
    expect(element.className).toBe('link');
    expect(element.getAttribute('href')).toBe('/x');
    expect(element.hasAttribute('hidden')).toBe(true);
    expect(element.hasAttribute('title')).toBe(false);
    expect(element.hasAttribute('id')).toBe(false);
    expect(element.textContent).toBe('text');
    expect(element.children).toHaveLength(1);
  });

  it('skips null, undefined and false children but keeps an empty string', () => {
    const element = el('p', {}, null, undefined, false, '', 'x');
    expect(element.childNodes).toHaveLength(2);
    expect(element.textContent).toBe('x');
  });

  it('works without options', () => {
    expect(el('div').outerHTML).toBe('<div></div>');
  });
});

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
