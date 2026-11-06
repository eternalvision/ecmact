import { describe, expect, it } from 'vitest';
import * as router from '@em/router';

describe('router', () => {
  it('exports createRouter', () => {
    expect(Object.keys(router)).toEqual(['createRouter']);
  });
});
