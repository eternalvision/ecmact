import { afterEach, describe, expect, it, vi } from 'vitest';
import * as lib from '@em';

vi.mock('@em/utils/env', { spy: true });

let env: typeof import('@em/utils/env') | undefined;

afterEach(() => {
  if (env) vi.mocked(env.pageHTMLElement).mockRestore();
  env = undefined;
  vi.resetModules();
});

describe('public API', () => {
  it('exports the documented runtime values', () => {
    expect(Object.keys(lib).sort()).toEqual([
      'CanceledError',
      'HttpError',
      'ThemeProvider',
      'batch',
      'computed',
      'configure',
      'createContext',
      'createHttp',
      'createJSONStorage',
      'createRouter',
      'createStore',
      'css',
      'defineWidget',
      'each',
      'effect',
      'em',
      'http',
      'isCancel',
      'isHttpError',
      'isSignal',
      'keyframes',
      'mount',
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
    vi.resetModules();
    env = await import('@em/utils/env');
    vi.mocked(env.pageHTMLElement).mockReturnValue(undefined);
    const withoutDom = await import('@em');
    // A real browser keeps evaluated modules after vi.resetModules; a query gives a fresh instance everywhere.
    // @ts-expect-error -- TypeScript does not resolve a module with a query
    const fresh: unknown = await import('@em/core/component?without-dom');
    const { Component } = fresh as typeof import('@em/core/component');
    expect(Object.getPrototypeOf(Component)).toBe(Object);
    expect(Object.keys(withoutDom).sort()).toEqual([
      'CanceledError',
      'HttpError',
      'ThemeProvider',
      'batch',
      'computed',
      'configure',
      'createContext',
      'createHttp',
      'createJSONStorage',
      'createRouter',
      'createStore',
      'css',
      'defineWidget',
      'each',
      'effect',
      'em',
      'http',
      'isCancel',
      'isHttpError',
      'isSignal',
      'keyframes',
      'mount',
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
