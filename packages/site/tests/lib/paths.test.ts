import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { basePath, trimSlashes, withBase } from '@site/lib/paths';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('paths', () => {
  it('reads the base without a trailing slash', () => {
    expect(basePath()).toBe('/ecmact');
  });

  it('is empty when the site is served from the root', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(basePath()).toBe('');
    expect(withBase('/docs')).toBe('/docs');
  });

  it('puts the base in front of a path', () => {
    expect(withBase('/docs/routing')).toBe('/ecmact/docs/routing');
  });
});

describe('trimSlashes', () => {
  it('removes every slash at the end', () => {
    expect(trimSlashes('/a/b//')).toBe('/a/b');
    expect(trimSlashes('/')).toBe('');
    expect(trimSlashes('')).toBe('');
  });

  it('stays fast when slashes are followed by another character', () => {
    const started = Date.now();
    trimSlashes(`${'/'.repeat(200000)}x`);
    expect(Date.now() - started).toBeLessThan(200);
  });
});
