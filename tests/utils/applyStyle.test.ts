import { describe, expect, it } from 'vitest';
import { applyStyle } from '../../src/utils/applyStyle';

describe('applyStyle', () => {
  it('applies camelCase keys as kebab-case properties', () => {
    const element = document.createElement('div');
    applyStyle(element, { backgroundColor: 'red' }, new Set());
    expect(element.style.getPropertyValue('background-color')).toBe('red');
  });

  it('converts numbers to strings', () => {
    const element = document.createElement('div');
    applyStyle(element, { zIndex: 2 }, new Set());
    expect(element.style.getPropertyValue('z-index')).toBe('2');
  });

  it('skips values that are not strings or numbers', () => {
    const element = document.createElement('div');
    const applied = applyStyle(
      element,
      { color: undefined, margin: {} as never, padding: true as never },
      new Set(),
    );
    expect(applied.size).toBe(0);
    expect(element.getAttribute('style') ?? '').toBe('');
  });

  it('defaults to an empty style', () => {
    const element = document.createElement('div');
    expect(applyStyle(element, undefined, new Set()).size).toBe(0);
  });

  it('returns the property names it applied', () => {
    const element = document.createElement('div');
    expect(applyStyle(element, { backgroundColor: 'red', color: 'blue' }, new Set())).toEqual(
      new Set(['background-color', 'color']),
    );
  });

  it('removes properties that are no longer present', () => {
    const element = document.createElement('div');
    const first = applyStyle(element, { color: 'red', padding: '1px' }, new Set());
    applyStyle(element, { color: 'blue' }, first);
    expect(element.style.getPropertyValue('color')).toBe('blue');
    expect(element.style.getPropertyValue('padding')).toBe('');
  });

  it('does not let a value break out of the element', () => {
    const element = document.createElement('div');
    applyStyle(element, { color: 'red;} </style><script>alert(1)</script>' }, new Set());
    expect(element.querySelector('script')).toBeNull();
    expect(element.ownerDocument.querySelector('script')).toBeNull();
  });
});
