import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createJSONStorage,
  persist,
  type PersistOptions,
  type PersistStorage,
  type StateStorage,
} from '@em/store/persist';
import { createStore } from '@em/store/store';

interface State {
  count: number;
  note: string;
}

const memory = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  const storage: StateStorage = {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => void data.set(name, value),
    removeItem: (name) => void data.delete(name),
  };
  return { data, storage };
};

const make = (storage: StateStorage, options: Partial<PersistOptions<State, unknown>> = {}) =>
  createStore(
    persist<State, unknown>(() => ({ count: 0, note: '' }), {
      name: 'k',
      storage: createJSONStorage(() => storage),
      ...options,
    }),
  );

const stored = (data: Map<string, string>) => JSON.parse(data.get('k') ?? 'null');
const flush = () => new Promise((done) => setTimeout(done, 0));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createJSONStorage', () => {
  it('parses and stringifies values', () => {
    const { data, storage } = memory();
    const json = createJSONStorage<State>(() => storage)!;
    json.setItem('k', { state: { count: 1, note: 'a' }, version: 2 });
    expect(JSON.parse(data.get('k')!)).toEqual({ state: { count: 1, note: 'a' }, version: 2 });
    expect(json.getItem('k')).toEqual({ state: { count: 1, note: 'a' }, version: 2 });
    json.removeItem('k');
    expect(json.getItem('k')).toBeNull();
  });

  it('uses the reviver and the replacer', () => {
    const { data, storage } = memory();
    const json = createJSONStorage<{ n: number }>(() => storage, {
      replacer: (_key, value) => (typeof value === 'number' ? value * 2 : value),
      reviver: (_key, value) => (typeof value === 'number' ? value / 2 : value),
    })!;
    json.setItem('k', { state: { n: 5 }, version: 0 });
    expect(data.get('k')).toContain('"n":10');
    expect(json.getItem('k')).toEqual({ state: { n: 5 }, version: 0 });
  });

  it('works with an asynchronous storage', async () => {
    const data = new Map<string, string>();
    const json = createJSONStorage<State>(() => ({
      getItem: async (name) => data.get(name) ?? null,
      setItem: async (name, value) => void data.set(name, value),
      removeItem: async (name) => void data.delete(name),
    }))!;
    await json.setItem('k', { state: { count: 1, note: '' }, version: 0 });
    expect(await json.getItem('k')).toEqual({ state: { count: 1, note: '' }, version: 0 });
    expect(
      await createJSONStorage(() => ({
        getItem: async () => null,
        setItem: () => {},
        removeItem: () => {},
      }))!.getItem('x'),
    ).toBeNull();
  });

  it('is undefined where the storage does not exist', () => {
    expect(
      createJSONStorage(() => {
        throw new Error('no storage');
      }),
    ).toBeUndefined();
  });
});

describe('persist', () => {
  it('reads the stored state when the store is created', () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 7 }, version: 0 }) });
    const store = make(storage);
    expect(store.getState()).toEqual({ count: 7, note: '' });
    expect(store.persist?.hasHydrated()).toBe(true);
  });

  it('does not write the initial state', () => {
    const { data, storage } = memory();
    make(storage);
    expect(data.size).toBe(0);
  });

  it('writes after every change', () => {
    const { data, storage } = memory();
    const store = make(storage);
    store.setState({ count: 2 });
    expect(stored(data)).toEqual({ state: { count: 2, note: '' }, version: 0 });
  });

  it('writes the changes that the creator makes through set', () => {
    const { data, storage } = memory();
    const store = createStore(
      persist<{ count: number; inc: () => void }>(
        (set) => ({ count: 0, inc: () => set((state) => ({ count: state.count + 1 })) }),
        { name: 'k', storage: createJSONStorage(() => storage) },
      ),
    );
    store.getState().inc();
    expect(stored(data).state.count).toBe(1);
  });

  it('persists only what partialize picks', () => {
    const { data, storage } = memory();
    const store = make(storage, { partialize: (state) => ({ count: state.count }) });
    store.setState({ count: 1, note: 'secret' });
    expect(stored(data).state).toEqual({ count: 1 });
  });

  it('writes the version', () => {
    const { data, storage } = memory();
    make(storage, { version: 3 }).setState({ count: 1 });
    expect(stored(data).version).toBe(3);
  });

  it('ignores a stored state of another version without migrate', () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 9 }, version: 1 }) });
    expect(make(storage, { version: 2 }).getState().count).toBe(0);
  });

  it('migrates a stored state of another version and writes it back', () => {
    const { data, storage } = memory({ k: JSON.stringify({ state: { total: 9 }, version: 1 }) });
    const store = make(storage, {
      version: 2,
      migrate: (persisted) => ({ count: (persisted as { total: number }).total }),
    });
    expect(store.getState().count).toBe(9);
    expect(stored(data)).toEqual({ state: { count: 9, note: '' }, version: 2 });
  });

  it('migrates asynchronously', async () => {
    const { storage } = memory({ k: JSON.stringify({ state: { total: 4 }, version: 0 }) });
    const store = make(storage, {
      version: 1,
      migrate: async (persisted) => ({ count: (persisted as { total: number }).total }),
    });
    await flush();
    expect(store.getState().count).toBe(4);
  });

  it('treats a stored value without a version as current', () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 5 } }) });
    expect(make(storage, { version: 2 }).getState().count).toBe(5);
  });

  it('merges with a custom merge function', () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 5 }, version: 0 }) });
    const store = make(storage, {
      merge: (persisted, current) => ({ ...current, count: (persisted as State).count + 100 }),
    });
    expect(store.getState().count).toBe(105);
  });

  it('can skip hydration and rehydrate on demand', async () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 7 }, version: 0 }) });
    const store = make(storage, { skipHydration: true });
    expect(store.getState().count).toBe(0);
    await store.persist?.rehydrate();
    expect(store.getState().count).toBe(7);
  });

  it('hydrates from an asynchronous storage', async () => {
    const storage: PersistStorage<State> = {
      getItem: async () => ({ state: { count: 3, note: '' }, version: 0 }),
      setItem: () => {},
      removeItem: () => {},
    };
    const store = createStore(
      persist<State>(() => ({ count: 0, note: '' }), { name: 'k', storage }),
    );
    expect(store.persist?.hasHydrated()).toBe(false);
    await flush();
    expect(store.getState().count).toBe(3);
    expect(store.persist?.hasHydrated()).toBe(true);
  });

  it('calls onRehydrateStorage before and after', async () => {
    const { storage } = memory({ k: JSON.stringify({ state: { count: 2 }, version: 0 }) });
    const after = vi.fn();
    const before = vi.fn(() => after);
    make(storage, { onRehydrateStorage: before });
    await flush();
    expect(before).toHaveBeenCalledWith({ count: 0, note: '' });
    expect(after).toHaveBeenCalledWith({ count: 2, note: '' });
  });

  it('works when onRehydrateStorage returns nothing', async () => {
    const { storage } = memory();
    const store = make(storage, { onRehydrateStorage: () => {} });
    await store.persist?.rehydrate();
    expect(store.persist?.hasHydrated()).toBe(true);
  });

  it('reports a storage that cannot be read', async () => {
    const after = vi.fn();
    const storage: PersistStorage<State> = {
      getItem: () => {
        throw new Error('broken');
      },
      setItem: () => {},
      removeItem: () => {},
    };
    const store = createStore(
      persist<State>(() => ({ count: 0, note: '' }), {
        name: 'k',
        storage,
        onRehydrateStorage: () => after,
      }),
    );
    await flush();
    expect(after).toHaveBeenCalledWith(undefined, expect.any(Error));
    expect(store.persist?.hasHydrated()).toBe(true);
  });

  it('reports an asynchronous storage that rejects', async () => {
    const after = vi.fn();
    const storage: PersistStorage<State> = {
      getItem: () => Promise.reject(new Error('later')),
      setItem: () => {},
      removeItem: () => {},
    };
    createStore(
      persist<State>(() => ({ count: 0, note: '' }), {
        name: 'k',
        storage,
        onRehydrateStorage: () => after,
      }),
    );
    await flush();
    expect(after).toHaveBeenCalledWith(undefined, expect.any(Error));
  });

  it('does nothing without a storage', () => {
    const store = createStore(
      persist<State>(() => ({ count: 0, note: '' }), {
        name: 'k',
        storage: createJSONStorage(() => {
          throw new Error('none');
        }),
      }),
    );
    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
    expect(store.persist?.clearStorage()).toBeUndefined();
  });

  it('uses localStorage by default', () => {
    localStorage.clear();
    const store = createStore(persist<State>(() => ({ count: 0, note: '' }), { name: 'default' }));
    store.setState({ count: 1 });
    expect(JSON.parse(localStorage.getItem('default')!).state.count).toBe(1);
    localStorage.clear();
  });
});

describe('persist api', () => {
  it('reads and changes the options', () => {
    const { data, storage } = memory();
    const store = make(storage, { version: 1 });
    expect(store.persist?.getOptions().version).toBe(1);
    const other = memory();
    store.persist?.setOptions({ version: 2, storage: createJSONStorage(() => other.storage) });
    store.setState({ count: 1 });
    expect(other.data.size).toBe(1);
    expect(data.size).toBe(0);
    store.persist?.setOptions({ version: 3 });
    store.setState({ count: 2 });
    expect(JSON.parse(other.data.get('k')!).version).toBe(3);
  });

  it('clears the storage', () => {
    const { data, storage } = memory();
    const store = make(storage);
    store.setState({ count: 1 });
    store.persist?.clearStorage();
    expect(data.size).toBe(0);
  });

  it('tells listeners when hydration starts and ends, until they are removed', async () => {
    const { storage } = memory();
    const store = make(storage, { skipHydration: true });
    const start = vi.fn();
    const end = vi.fn();
    const stopStart = store.persist!.onHydrate(start);
    const stopEnd = store.persist!.onFinishHydration(end);
    await store.persist!.rehydrate();
    expect(start).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    stopStart();
    stopEnd();
    await store.persist!.rehydrate();
    expect(start).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
  });
});
