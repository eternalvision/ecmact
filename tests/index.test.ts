import { afterEach, describe, expect, it, vi } from 'vitest';
import * as lib from '@em';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('public API', () => {
  it('exports the documented runtime values', () => {
    expect(Object.keys(lib).sort()).toEqual([
      'CanceledError',
      'HttpError',
      'ThemeProvider',
      'batch',
      'combine',
      'computed',
      'configure',
      'consume',
      'createContext',
      'createHttp',
      'createJSONStorage',
      'createRouter',
      'createStore',
      'css',
      'defineWidget',
      'devtools',
      'effect',
      'em',
      'http',
      'isCancel',
      'isHttpError',
      'isSignal',
      'keyframes',
      'mount',
      'persist',
      'provide',
      'resource',
      'shallow',
      'signal',
      'styled',
      'tags',
      'themeContext',
      'toFormData',
      'untracked',
      'useTheme',
    ]);
  });

  it('can be imported without a DOM', async () => {
    vi.stubGlobal('HTMLElement', undefined);
    vi.resetModules();
    const withoutDom = await import('@em');
    expect(Object.keys(withoutDom).sort()).toEqual([
      'CanceledError',
      'HttpError',
      'ThemeProvider',
      'batch',
      'combine',
      'computed',
      'configure',
      'consume',
      'createContext',
      'createHttp',
      'createJSONStorage',
      'createRouter',
      'createStore',
      'css',
      'defineWidget',
      'devtools',
      'effect',
      'em',
      'http',
      'isCancel',
      'isHttpError',
      'isSignal',
      'keyframes',
      'mount',
      'persist',
      'provide',
      'resource',
      'shallow',
      'signal',
      'styled',
      'tags',
      'themeContext',
      'toFormData',
      'untracked',
      'useTheme',
    ]);
  });
});
