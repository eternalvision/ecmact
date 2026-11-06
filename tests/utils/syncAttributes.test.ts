import { describe, expect, it } from 'vitest';
import { syncAttributes } from '../../src/utils/syncAttributes';

const sync = (element: HTMLElement, props: Record<string, unknown>, previous = new Set<string>()) =>
  syncAttributes(element, props as never, previous);

describe('syncAttributes', () => {
  it('sets string and number attributes', () => {
    const element = document.createElement('input');
    sync(element, { placeholder: 'name', maxlength: 5 });
    expect(element.getAttribute('placeholder')).toBe('name');
    expect(element.getAttribute('maxlength')).toBe('5');
  });

  it('sets true as an empty attribute', () => {
    const element = document.createElement('input');
    sync(element, { disabled: true });
    expect(element.getAttribute('disabled')).toBe('');
  });

  it('skips false, null, undefined, objects and functions', () => {
    const element = document.createElement('div');
    sync(element, { a: false, b: null, c: undefined, d: {}, e: () => {} });
    expect(element.getAttributeNames()).toEqual([]);
  });

  it('does not allow attribute value injection', () => {
    const element = document.createElement('div');
    sync(element, { title: '"><script>alert(1)</script>' });
    expect(element.querySelector('script')).toBeNull();
    expect(element.getAttribute('title')).toBe('"><script>alert(1)</script>');
  });

  it('skips reserved keys', () => {
    const element = document.createElement('div');
    sync(element, {
      tag: 'a',
      content: 'x',
      html: 'x',
      style: {},
      css: 'x',
      children: [],
      ref: () => {},
      shadow: false,
      mounted: () => {},
      unmounted: () => {},
      beforeUpdate: () => {},
      updated: () => {},
    });
    expect(element.getAttributeNames()).toEqual([]);
  });

  it('skips event handlers', () => {
    const element = document.createElement('div');
    sync(element, { onclick: () => {}, oninput: 'x' });
    expect(element.getAttributeNames()).toEqual([]);
  });

  it('returns the names of the attributes it set', () => {
    const element = document.createElement('div');
    expect(sync(element, { title: 'a', hidden: true, skipped: false })).toEqual(
      new Set(['title', 'hidden']),
    );
  });

  it('removes attributes that are no longer present', () => {
    const element = document.createElement('div');
    const first = sync(element, { title: 'a', lang: 'en' });
    sync(element, { lang: 'en' }, first);
    expect(element.hasAttribute('title')).toBe(false);
    expect(element.getAttribute('lang')).toBe('en');
  });

  it('removes attributes whose value became false, null or undefined', () => {
    const element = document.createElement('div');
    const first = sync(element, { title: 'a', lang: 'en', dir: 'ltr' });
    sync(element, { title: false, lang: null, dir: undefined }, first);
    expect(element.getAttributeNames()).toEqual([]);
  });

  it('updates changed values', () => {
    const element = document.createElement('div');
    const first = sync(element, { title: 'a' });
    sync(element, { title: 'b' }, first);
    expect(element.getAttribute('title')).toBe('b');
  });
});
