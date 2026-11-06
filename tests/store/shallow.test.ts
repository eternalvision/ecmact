import { describe, expect, it } from 'vitest';
import { shallow } from '@em/store/shallow';

describe('shallow', () => {
  it('treats identical values as equal', () => {
    const value = { a: 1 };
    expect(shallow(value, value)).toBe(true);
    expect(shallow(1, 1)).toBe(true);
    expect(shallow(NaN, NaN)).toBe(true);
  });

  it('compares primitives that differ, and primitives with objects', () => {
    expect(shallow(1, 2)).toBe(false);
    expect(shallow('a' as unknown, { a: 1 })).toBe(false);
    expect(shallow(null as unknown, {})).toBe(false);
    expect(shallow({}, null as unknown)).toBe(false);
  });

  it('compares objects one level deep', () => {
    expect(shallow({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
    expect(shallow({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallow({ a: {} }, { a: {} })).toBe(false);
    expect(shallow({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallow({ a: undefined }, { b: undefined } as never)).toBe(false);
  });

  it('compares arrays by their items', () => {
    expect(shallow([1, 2], [1, 2])).toBe(true);
    expect(shallow([1, 2], [1, 3])).toBe(false);
    expect(shallow([1], [1, 2])).toBe(false);
  });

  it('compares maps and sets by their entries', () => {
    expect(shallow(new Map([[1, 'a']]), new Map([[1, 'a']]))).toBe(true);
    expect(shallow(new Map([[1, 'a']]), new Map([[1, 'b']]))).toBe(false);
    expect(shallow(new Map([[1, 'a']]), new Map([[2, 'a']]))).toBe(false);
    expect(shallow(new Map([[1, 'a']]), new Map())).toBe(false);
    expect(shallow(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(shallow(new Set([1]), new Set([2]))).toBe(false);
    expect(shallow(new Set([1]), new Set())).toBe(false);
  });

  it('does not equate objects of different kinds', () => {
    expect(shallow(Object.create({}) as object, {})).toBe(false);
    expect(shallow(new Set() as unknown, new Map())).toBe(false);
  });
});
