import { afterEach, describe, expect, it, vi } from 'vitest';
import * as lib from '../src';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('public API', () => {
  it('exports the documented runtime values', () => {
    expect(Object.keys(lib).sort()).toEqual(['configure', 'em', 'mount', 'tags']);
  });

  it('can be imported without a DOM', async () => {
    vi.stubGlobal('HTMLElement', undefined);
    vi.resetModules();
    const withoutDom = await import('../src');
    expect(Object.keys(withoutDom).sort()).toEqual(['configure', 'em', 'mount', 'tags']);
  });
});
