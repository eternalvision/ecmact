import { describe, expect, it } from 'vitest';
import * as utils from '@em/utils';

describe('utils', () => {
  it('exports the internal helpers', () => {
    expect(Object.keys(utils).sort()).toEqual([
      'applyStyle',
      'applyStyleSheets',
      'isComponent',
      'mount',
      'propsEqual',
      'reconcileChildren',
      'registerComponent',
      'render',
      'resetWarnings',
      'resolveProps',
      'setEventListeners',
      'syncAttributes',
      'toNodes',
      'warn',
    ]);
  });
});
