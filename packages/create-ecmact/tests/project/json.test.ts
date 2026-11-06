import { describe, expect, it } from 'vitest';
import { mergeJson } from '@create/project/json';

describe('mergeJson', () => {
  it('merges nested objects and lets the overlay win', () => {
    expect(mergeJson({ a: { x: 1, y: 2 }, b: 1 }, { a: { y: 3, z: 4 }, c: 5 })).toEqual({
      a: { x: 1, y: 3, z: 4 },
      b: 1,
      c: 5,
    });
  });

  it('replaces arrays and primitives instead of merging them', () => {
    expect(mergeJson({ list: [1, 2], value: { a: 1 } }, { list: [3], value: 'text' })).toEqual({
      list: [3],
      value: 'text',
    });
  });

  it('does not change its inputs', () => {
    const base = { a: { x: 1 } };
    mergeJson(base, { a: { y: 2 } });
    expect(base).toEqual({ a: { x: 1 } });
  });
});
