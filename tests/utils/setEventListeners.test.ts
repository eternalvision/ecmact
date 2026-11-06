import { describe, expect, it, vi } from 'vitest';
import { setEventListeners } from '../../src/utils/setEventListeners';

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

  it('returns the listeners it attached', () => {
    const element = document.createElement('div');
    const handler = vi.fn();
    const listeners = setEventListeners(element, { onClick: handler }, new Map());
    expect(listeners.get('click')).toBe(handler);
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
