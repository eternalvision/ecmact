import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setEventListeners } from '../../src/utils/setEventListeners';
import { resetWarnings } from '../../src/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
});

describe('setEventListeners', () => {
  it('attaches handlers under the lowercased event name', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    setEventListeners(element, { onclick: handler }, new Map());
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores handlers that are not functions', () => {
    const element = document.createElement('div');
    const listeners = setEventListeners(element, { onclick: 'alert(1)' } as never, new Map());
    expect(listeners.size).toBe(0);
    expect(() => element.click()).not.toThrow();
  });

  it('ignores props that do not start with on', () => {
    const element = document.createElement('div');
    expect(setEventListeners(element, { title: () => {} } as never, new Map()).size).toBe(0);
  });

  it('returns the listeners it attached, keyed by lowercase event name', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const listeners = setEventListeners(element, { onClick: handler } as never, new Map());
    expect([...listeners.keys()]).toEqual(['click']);
    listeners.get('click')!(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rethrows handler errors when no reporter is given', () => {
    const element = document.createElement('div');
    const error = new Error('boom');
    const listeners = setEventListeners(
      element,
      {
        onclick: () => {
          throw error;
        },
      },
      new Map(),
    );
    expect(() => listeners.get('click')!(new Event('click'))).toThrow(error);
  });

  it('passes handler errors and the event name to the reporter', () => {
    const element = document.createElement('div');
    const error = new Error('boom');
    const onError = vi.fn();
    const listeners = setEventListeners(
      element,
      {
        onclick: () => {
          throw error;
        },
      },
      new Map(),
      onError,
    );
    listeners.get('click')!(new Event('click'));
    expect(onError).toHaveBeenCalledWith(error, 'click');
  });

  it('removes the wrapped listeners it attached before', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const first = setEventListeners(element, { onclick: handler }, new Map());
    setEventListeners(element, { onclick: handler }, first);
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('warns about handlers that are not functions', () => {
    const element = document.createElement('div');
    setEventListeners(element, { onclick: 'alert(1)' } as never, new Map());
    expect(spy).toHaveBeenCalledWith('ecmact: handler "onclick" is not a function and was ignored');
  });

  it('stays quiet about empty handlers', () => {
    const element = document.createElement('div');
    setEventListeners(
      element,
      { onclick: undefined, onfocus: null, onblur: false } as never,
      new Map(),
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('replaces the previous listeners', () => {
    const element = document.createElement('div');
    const first = vi.fn();
    const second = vi.fn();
    const previous = setEventListeners(element, { onclick: first }, new Map());
    setEventListeners(element, { onclick: second }, previous);
    element.click();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('removes listeners that are no longer present', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const previous = setEventListeners(element, { onclick: handler }, new Map());
    setEventListeners(element, {}, previous);
    element.click();
    expect(handler).not.toHaveBeenCalled();
  });
});
