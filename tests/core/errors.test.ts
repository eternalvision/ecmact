import { afterEach, describe, expect, it, vi } from 'vitest';
import { configure } from '@em';
import { resetConfig } from '@em/core/config';
import { catchErrors, guard, report } from '@em/core/errors';

afterEach(() => {
  resetConfig();
});

describe('report', () => {
  it('rethrows without a handler', () => {
    const error = new Error('x');
    expect(() => report(error, document.createElement('div'), 'mounted')).toThrow(error);
  });

  it('passes the error to the handler of the element', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    catchErrors(element, handler);
    report('oops', element, 'event', 'click');
    expect(handler).toHaveBeenCalledWith('oops', { element, phase: 'event', event: 'click' });
  });

  it('finds the nearest handler above, across shadow roots', () => {
    const outer = document.createElement('div');
    const host = document.createElement('div');
    const leaf = document.createElement('span');
    outer.append(host);
    host.attachShadow({ mode: 'open' }).append(leaf);
    const far = vi.fn();
    catchErrors(outer, far);
    report('a', leaf, 'event');
    expect(far).toHaveBeenCalledTimes(1);
    const near = vi.fn();
    catchErrors(host, near);
    report('b', leaf, 'event');
    expect(near).toHaveBeenCalledTimes(1);
    expect(far).toHaveBeenCalledTimes(1);
  });

  it('falls back to the configured handler', () => {
    const onError = vi.fn();
    configure({ onError });
    const element = document.createElement('div');
    report('x', element, 'unmounted');
    expect(onError).toHaveBeenCalledWith('x', { element, phase: 'unmounted', event: undefined });
  });
});

describe('guard', () => {
  it('returns the result of the function', () => {
    expect(guard(document.createElement('div'), 'mounted', () => 5)).toBe(5);
  });

  it('reports an error and returns undefined', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    catchErrors(element, handler);
    const result = guard(element, 'cleanup', () => {
      throw new Error('bad');
    });
    expect(result).toBeUndefined();
    expect(handler.mock.calls[0][1]).toEqual({ element, phase: 'cleanup', event: undefined });
  });
});
