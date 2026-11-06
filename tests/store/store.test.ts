import { describe, expect, it, vi } from 'vitest';
import { createStore } from '@em/store/store';
import { effect } from '@em/signals/signals';
import { shallow } from '@em/store/shallow';

interface Counter {
  count: number;
  label: string;
  inc: () => void;
}

const counter = () =>
  createStore<Counter>((set) => ({
    count: 0,
    label: 'a',
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));

describe('createStore', () => {
  it('builds the state from the creator', () => {
    const store = counter();
    expect(store.getState().count).toBe(0);
    expect(store.getInitialState()).toBe(store.getState());
  });

  it('gives the creator set, get and the store', () => {
    let seen: unknown[] = [];
    const store = createStore((set, get, api) => {
      seen = [typeof set, typeof get, api];
      return { a: 1 };
    });
    expect(seen).toEqual(['function', 'function', store]);
  });

  it('merges objects into the state', () => {
    const store = counter();
    store.setState({ count: 5 });
    expect(store.getState().count).toBe(5);
    expect(store.getState().label).toBe('a');
  });

  it('accepts a function of the state', () => {
    const store = counter();
    store.getState().inc();
    store.getState().inc();
    expect(store.getState().count).toBe(2);
  });

  it('replaces the state when asked', () => {
    const store = createStore<Record<string, number>>(() => ({ a: 1, b: 2 }));
    store.setState({ c: 3 }, true);
    expect(store.getState()).toEqual({ c: 3 });
  });

  it('replaces a state that is not an object', () => {
    const store = createStore(() => 1);
    store.setState(5);
    store.setState((value) => value + 1);
    expect(store.getState()).toBe(6);
    const nothing = createStore<{ a: number } | null>(() => null);
    nothing.setState({ a: 1 });
    expect(nothing.getState()).toEqual({ a: 1 });
    nothing.setState(null);
    expect(nothing.getState()).toBeNull();
  });

  it('does not notify when the state is the same value', () => {
    const store = counter();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState(store.getState());
    store.setState((state) => state);
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies listeners with the new and the previous state', () => {
    const store = counter();
    const listener = vi.fn();
    const before = store.getState();
    store.subscribe(listener);
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith(store.getState(), before);
  });

  it('stops notifying after the returned function is called', () => {
    const store = counter();
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    stop();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('lets a listener stop itself while being notified', () => {
    const store = counter();
    const other = vi.fn();
    const stop = store.subscribe(() => stop());
    store.subscribe(other);
    store.setState({ count: 1 });
    expect(other).toHaveBeenCalledTimes(1);
  });

  it('exposes the state as a signal', () => {
    const store = counter();
    const seen: number[] = [];
    effect(() => {
      seen.push(store.state.value.count);
    });
    store.setState({ count: 3 });
    expect(seen).toEqual([0, 3]);
  });

  it('runs onReady callbacks after creation, and at once afterwards', () => {
    const order: string[] = [];
    const store = createStore((_set, _get, api) => {
      api.onReady(() => order.push('ready'));
      order.push('creator');
      return {};
    });
    expect(order).toEqual(['creator', 'ready']);
    store.onReady(() => order.push('late'));
    expect(order).toEqual(['creator', 'ready', 'late']);
  });
});

describe('watch', () => {
  it('calls the listener when the selected value changes', () => {
    const store = counter();
    const listener = vi.fn();
    store.watch((state) => state.count, listener);
    store.setState({ label: 'b' });
    expect(listener).not.toHaveBeenCalled();
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledWith(2, 0);
  });

  it('can call the listener at once', () => {
    const store = counter();
    const listener = vi.fn();
    store.watch((state) => state.count, listener, { fireImmediately: true });
    expect(listener).toHaveBeenCalledWith(0, 0);
  });

  it('compares with equalityFn', () => {
    const store = counter();
    const listener = vi.fn();
    store.watch((state) => ({ count: state.count }), listener, { equalityFn: shallow });
    store.setState({ label: 'b' });
    expect(listener).not.toHaveBeenCalled();
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can be stopped', () => {
    const store = counter();
    const listener = vi.fn();
    store.watch((state) => state.count, listener)();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('select', () => {
  it('follows a part of the state as a signal', () => {
    const store = counter();
    const count = store.select((state) => state.count);
    expect(count.value).toBe(0);
    store.setState({ count: 4 });
    expect(count.value).toBe(4);
  });

  it('does not change when something else does', () => {
    const store = counter();
    const count = store.select((state) => state.count);
    const seen: number[] = [];
    effect(() => {
      seen.push(count.value);
    });
    store.setState({ label: 'b' });
    expect(seen).toEqual([0]);
  });

  it('keeps the previous value while equalityFn says nothing changed', () => {
    const store = counter();
    const pair = store.select((state) => ({ count: state.count }), shallow);
    const first = pair.value;
    store.setState({ label: 'b' });
    expect(pair.value).toBe(first);
    store.setState({ count: 9 });
    expect(pair.value).not.toBe(first);
    expect(pair.value).toEqual({ count: 9 });
  });
});
