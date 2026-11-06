import { afterEach, describe, expect, it, vi } from 'vitest';
import * as lib from '@em';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('public API', () => {
  it('exports the documented runtime values', () => {
    expect(Object.keys(lib).sort()).toEqual([
      'batch',
      'computed',
      'configure',
      'consume',
      'createContext',
      'createRouter',
      'effect',
      'em',
      'isSignal',
      'mount',
      'provide',
      'resource',
      'signal',
      'tags',
      'untracked',
    ]);
  });

  it('can be imported without a DOM', async () => {
    vi.stubGlobal('HTMLElement', undefined);
    vi.resetModules();
    const withoutDom = await import('@em');
    expect(Object.keys(withoutDom).sort()).toEqual([
      'batch',
      'computed',
      'configure',
      'consume',
      'createContext',
      'createRouter',
      'effect',
      'em',
      'isSignal',
      'mount',
      'provide',
      'resource',
      'signal',
      'tags',
      'untracked',
    ]);
  });
});
