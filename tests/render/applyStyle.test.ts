import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyStyle, setStyle } from '@em/render/applyStyle';
import { resetWarnings } from '@em/utils/warn';

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

describe('setStyle', () => {
  it('sets a property and returns its kebab-case name', () => {
    const element = document.createElement('div');
    expect(setStyle(element, 'fontSize', '12px')).toBe('font-size');
    expect(element.style.fontSize).toBe('12px');
  });

  it('removes the property for empty values and returns nothing', () => {
    const element = document.createElement('div');
    setStyle(element, 'color', 'red');
    expect(setStyle(element, 'color', null)).toBeUndefined();
    expect(element.style.color).toBe('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('removes the property and warns for values that cannot be set', () => {
    const element = document.createElement('div');
    setStyle(element, 'color', 'red');
    setStyle(element, 'color', {});
    expect(element.style.color).toBe('');
    expect(spy).toHaveBeenCalledWith(
      'ecmact: style "color" was ignored, object values cannot be set',
    );
  });

  it('sets a number as pixels for a length', () => {
    const element = document.createElement('div');
    setStyle(element, 'width', 240);
    setStyle(element, 'marginTop', 0);
    expect(element.style.width).toBe('240px');
    expect(element.style.marginTop).toBe('0px');
  });

  it('keeps a number as it is for properties that take plain numbers', () => {
    const element = document.createElement('div');
    setStyle(element, 'opacity', 0.5);
    setStyle(element, 'zIndex', 2);
    setStyle(element, 'flexGrow', 1);
    expect(element.style.opacity).toBe('0.5');
    expect(element.style.zIndex).toBe('2');
    expect(element.style.flexGrow).toBe('1');
  });

  it('sets custom properties by their own name, numbers without a unit', () => {
    const element = document.createElement('div');
    expect(setStyle(element, '--gapSize', 4)).toBe('--gapSize');
    expect(element.style.getPropertyValue('--gapSize')).toBe('4');
  });
});
