import { afterEach, describe, expect, it } from 'vitest';
import { configure, getConfig, resetConfig } from '../src/config';

afterEach(() => {
  resetConfig();
});

describe('config', () => {
  it('has defaults', () => {
    expect(getConfig()).toEqual({ shadow: true, styles: [], warnings: true });
  });

  it('configure overrides the given options', () => {
    configure({ shadow: false });
    expect(getConfig().shadow).toBe(false);
  });

  it('merges options between calls', () => {
    configure({ shadow: false });
    configure({ styles: ['div {}'] });
    expect(getConfig()).toEqual({ shadow: false, styles: ['div {}'], warnings: true });
  });

  it('replaces style lists instead of appending', () => {
    configure({ styles: ['a {}'] });
    configure({ styles: ['b {}'] });
    expect(getConfig().styles).toEqual(['b {}']);
  });

  it('resetConfig restores the defaults', () => {
    configure({ shadow: false, styles: ['a {}'] });
    resetConfig();
    expect(getConfig()).toEqual({ shadow: true, styles: [], warnings: true });
  });

  it('stores an error handler and the warnings switch', () => {
    const onError = () => {};
    configure({ onError, warnings: false });
    expect(getConfig().onError).toBe(onError);
    expect(getConfig().warnings).toBe(false);
  });

  it('stores an error handler and the warnings switch', () => {
    const onError = () => {};
    configure({ onError, warnings: false });
    expect(getConfig().onError).toBe(onError);
    expect(getConfig().warnings).toBe(false);
  });
});
