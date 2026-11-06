import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyStyle } from '../../src/utils/applyStyle';
import { resetWarnings } from '../../src/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
});

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

  it('warns about values that cannot be applied', () => {
    const element = document.createElement('div');
    applyStyle(element, { margin: {} as never, padding: true as never }, new Set());
    expect(spy).toHaveBeenCalledWith(
      'ecmact: style "margin" was ignored, object values cannot be set',
    );
    expect(spy).toHaveBeenCalledWith(
      'ecmact: style "padding" was ignored, boolean values cannot be set',
    );
  });

  it('stays quiet about undefined, null and false', () => {
    const element = document.createElement('div');
    applyStyle(
      element,
      { color: undefined, margin: null as never, padding: false as never },
      new Set(),
    );
    expect(spy).not.toHaveBeenCalled();
  });
});
