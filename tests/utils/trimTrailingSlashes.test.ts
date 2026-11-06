import { describe, expect, it } from 'vitest';
import { trimTrailingSlashes } from '@em/utils/trimTrailingSlashes';

describe('trimTrailingSlashes', () => {
  it('removes every slash at the end and nothing else', () => {
    expect(trimTrailingSlashes('/app///')).toBe('/app');
    expect(trimTrailingSlashes('/a/b/')).toBe('/a/b');
    expect(trimTrailingSlashes('/app')).toBe('/app');
    expect(trimTrailingSlashes('')).toBe('');
  });

  it('turns a string of slashes into an empty string', () => {
    expect(trimTrailingSlashes('///')).toBe('');
  });

  it('stays fast when slashes are followed by another character', () => {
    const started = Date.now();
    expect(trimTrailingSlashes(`${'/'.repeat(200000)}x`)).toBe(`${'/'.repeat(200000)}x`);
    expect(Date.now() - started).toBeLessThan(200);
  });
});
