import { describe, expect, it } from 'vitest';
import * as utils from '@em/utils';

describe('utils', () => {
  it('exports the internal helpers', () => {
    expect(Object.keys(utils).sort()).toEqual([
      'applyStyle',
      'applyStyleSheets',
      'mount',
      'propsEqual',
      'render',
      'resetWarnings',
      'resolveProps',
      'setEventListeners',
      'syncAttributes',
      'warn',
    ]);
  });
});
