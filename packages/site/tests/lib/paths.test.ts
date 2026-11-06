import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { basePath, withBase } from '@site/lib/paths';

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
