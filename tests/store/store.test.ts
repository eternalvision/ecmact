import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createJSONStorage, type StateStorage } from '@em/store/persist';
import { createBase, createStore } from '@em/store/store';
import { effect } from '@em/signals/signals';
import { shallow } from '@em/store/shallow';

interface Counter {
  count: number;
  label: string;
  inc: () => void;
}

const counter = () =>
  createBase<Counter>((set) => ({
    count: 0,
    label: 'a',
    inc: () => set((state) => ({ count: state.count + 1 })),
  }));

describe('createBase', () => {
  it('builds the state from the creator', () => {
    const store = counter();
    expect(store.getState().count).toBe(0);
    expect(store.getInitialState()).toBe(store.getState());
  });

  it('gives the creator set, get and the store', () => {
    let seen: unknown[] = [];
    const store = createBase((set, get, api) => {
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
    const store = createBase<Record<string, number>>(() => ({ a: 1, b: 2 }));
    store.setState({ c: 3 }, true);
    expect(store.getState()).toEqual({ c: 3 });
  });

  it('replaces a state that is not an object', () => {
    const store = createBase(() => 1);
    store.setState(5);
    store.setState((value) => value + 1);
    expect(store.getState()).toBe(6);
    const nothing = createBase<{ a: number } | null>(() => null);
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
    const store = createBase((_set, _get, api) => {
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

describe('createStore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const cart = () =>
    createStore({ items: [] as string[], note: '' }, (set, get) => ({
      add: (item: string) => set((state) => ({ items: [...state.items, item] })),
      count: () => get().items.length,
    }));

  it('has the values and the actions as properties', () => {
    const store = cart();
    store.add('book');
    expect(store.items).toEqual(['book']);
    expect(store.count()).toBe(1);
    expect(store.getState().items).toEqual(['book']);
    expect(Object.keys(store)).toEqual(expect.arrayContaining(['items', 'note', 'add', 'count']));
  });

  it('works without actions', () => {
    const store = createStore({ count: 1 });
    store.setState({ count: 2 });
    expect(store.count).toBe(2);
  });

  it('follows a value inside an effect, and only that value', () => {
    const store = cart();
    const seen = vi.fn(() => void store.note);
    effect(seen);
    store.add('book');
    expect(seen).toHaveBeenCalledTimes(1);
    store.setState({ note: 'x' });
    expect(seen).toHaveBeenCalledTimes(2);
  });

  it('gives the actions the store', () => {
    const store = createStore({ count: 0 }, (_set, _get, api) => ({
      reset: () => api.setState({ count: 0 }),
    }));
    store.setState({ count: 5 });
    store.reset();
    expect(store.count).toBe(0);
  });

  it('keeps things in the actions that are not functions', () => {
    const store = createStore({ count: 0 }, () => ({ limit: 3 }));
    expect(store.limit).toBe(3);
  });

  it('refuses a name that the store uses itself', () => {
    expect(() => createStore({ select: 1 } as never)).toThrow('a store uses "select" itself');
    expect(() => createStore({ count: 0 }, () => ({ subscribe: () => {} }) as never)).toThrow(
      TypeError,
    );
  });

  it('infers the types of the values and the actions', () => {
    const store = cart();
    expectTypeOf(store.items).toEqualTypeOf<string[]>();
    expectTypeOf(store.add).toEqualTypeOf<(item: string) => void>();
    expectTypeOf(store.getState().count).toEqualTypeOf<() => number>();
    const wrong = () => {
      // @ts-expect-error a reserved name
      createStore({ state: 1 });
      // @ts-expect-error values are read only, change them with an action
      store.note = 'x';
    };
    expect(wrong).toThrow(TypeError);
  });

  it('persists the state with the persist option', () => {
    const data = new Map<string, string>();
    const strings: StateStorage = {
      getItem: (name) => data.get(name) ?? null,
      setItem: (name, value) => void data.set(name, value),
      removeItem: (name) => void data.delete(name),
    };
    const make = () =>
      createStore(
        { count: 0 },
        (set) => ({ inc: () => set((state) => ({ count: state.count + 1 })) }),
        { persist: { name: 'counter', storage: createJSONStorage(() => strings) } },
      );
    const first = make();
    first.inc();
    expect(JSON.parse(data.get('counter')!).state.count).toBe(1);
    const second = make();
    expect(second.count).toBe(1);
    expect(second.persist?.hasHydrated()).toBe(true);
    second.inc();
    expect(second.count).toBe(2);
  });

  it('names the changes after the actions for the devtools', () => {
    const send = vi.fn();
    const connect = vi.fn(() => ({ init: vi.fn(), send, subscribe: vi.fn() }));
    vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION__', { connect });
    const make = (devtools: boolean | { name: string }) =>
      createStore(
        { count: 0 },
        (set) => ({
          inc: () => set((state) => ({ count: state.count + 1 })),
          set: (count: number) => set({ count }, false, 'custom'),
        }),
        { devtools },
      );
    const plain = make(true);
    plain.inc();
    expect(send).toHaveBeenLastCalledWith({ type: 'inc' }, expect.objectContaining({ count: 1 }));
    plain.setState({ count: 5 });
    expect(send).toHaveBeenLastCalledWith({ type: 'anonymous' }, expect.anything());
    const named = make({ name: 'counter' });
    named.inc();
    expect(send).toHaveBeenLastCalledWith({ type: 'counter/inc' }, expect.anything());
    named.set(3);
    expect(send).toHaveBeenLastCalledWith({ type: 'custom' }, expect.anything());
    expect(connect).toHaveBeenLastCalledWith({ name: 'counter' });
  });

  it('does not connect to the devtools unless asked', () => {
    const connect = vi.fn();
    vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION__', { connect });
    createStore({ count: 0 });
    createStore({ count: 0 }, undefined, { devtools: false });
    expect(connect).not.toHaveBeenCalled();
  });

  it('restores the action name when an action calls another one or throws', () => {
    const send = vi.fn();
    vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION__', {
      connect: () => ({ init: vi.fn(), send, subscribe: vi.fn() }),
    });
    const store = createStore(
      { count: 0 },
      (set) => ({
        fail: () => {
          throw new Error('x');
        },
        inner: () => set({ count: 1 }),
        outer: () => {
          store.inner();
          set({ count: 2 });
        },
      }),
      { devtools: true },
    );
    expect(() => store.fail()).toThrow('x');
    store.outer();
    expect(send.mock.calls.map(([action]) => action.type)).toEqual(['inner', 'outer']);
    store.setState({ count: 3 });
    expect(send).toHaveBeenLastCalledWith({ type: 'anonymous' }, expect.anything());
  });
});
