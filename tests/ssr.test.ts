import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('without a DOM', () => {
  it('imports without HTMLElement', async () => {
    vi.stubGlobal('HTMLElement', undefined);
    vi.resetModules();
    const lib = await import('../src');
    expect(Object.keys(lib).sort()).toEqual(['em', 'mount']);
  });
});
