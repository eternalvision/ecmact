import { describe, expect, it } from 'vitest';
import { propsEqual } from '../../src/utils/propsEqual';

describe('propsEqual', () => {
  it('is true for the same values', () => {
    const handler = () => {};
    expect(propsEqual({ content: 'a', onclick: handler }, { content: 'a', onclick: handler })).toBe(
      true,
    );
  });

  it('is true for empty props', () => {
    expect(propsEqual({}, {})).toBe(true);
  });

  it('is false when a value differs', () => {
    expect(propsEqual({ content: 'a' }, { content: 'b' })).toBe(false);
  });

  it('is false when a key is missing on either side', () => {
    expect(propsEqual({ content: 'a' }, {})).toBe(false);
    expect(propsEqual({}, { content: 'a' })).toBe(false);
  });

  it('compares style objects shallowly', () => {
    expect(propsEqual({ style: { color: 'red' } }, { style: { color: 'red' } })).toBe(true);
    expect(propsEqual({ style: { color: 'red' } }, { style: { color: 'blue' } })).toBe(false);
    expect(propsEqual({ style: { color: 'red' } }, { style: {} })).toBe(false);
  });

  it('is false when only one side has a style object', () => {
    expect(propsEqual({ style: { color: 'red' } }, {})).toBe(false);
  });

  it('compares children arrays by identity', () => {
    const children = [document.createElement('i')];
    expect(propsEqual({ children }, { children })).toBe(true);
    expect(propsEqual({ children }, { children: [...children] })).toBe(false);
  });

  it('uses Object.is semantics', () => {
    expect(propsEqual({ tabindex: NaN }, { tabindex: NaN })).toBe(true);
  });
});
