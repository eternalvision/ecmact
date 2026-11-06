import type { SetState, StateCreator } from '@em/store/store';

/**
 * What is written to the storage: the state and its version.
 *
 * @template S - The persisted part of the state.
 */
export interface StorageValue<S> {
  /** The persisted state. */
  state: S;
  /** The version it was written with. */
  version?: number;
}

/**
 * A storage that `persist` can use. Methods may return promises, for asynchronous storages.
 *
 * @template S - The persisted part of the state.
 */
export interface PersistStorage<S> {
  /**
   * Reads the stored value.
   *
   * @param name - The key.
   * @returns The value, or `null` if there is none, or a promise of either.
   */
  getItem(name: string): StorageValue<S> | null | Promise<StorageValue<S> | null>;
  /**
   * Writes a value.
   *
   * @param name - The key.
   * @param value - The value.
   * @returns Nothing, or a promise of it.
   */
  setItem(name: string, value: StorageValue<S>): unknown;
  /**
   * Removes a value.
   *
   * @param name - The key.
   * @returns Nothing, or a promise of it.
   */
  removeItem(name: string): unknown;
}

/** A storage of strings, such as `localStorage`. */
export interface StateStorage {
  /**
   * Reads a string.
   *
   * @param name - The key.
   * @returns The string, or `null`, or a promise of either.
   */
  getItem(name: string): string | null | Promise<string | null>;
  /**
   * Writes a string.
   *
   * @param name - The key.
   * @param value - The string.
   * @returns Nothing, or a promise of it.
   */
  setItem(name: string, value: string): unknown;
  /**
   * Removes a string.
   *
   * @param name - The key.
   * @returns Nothing, or a promise of it.
   */
  removeItem(name: string): unknown;
}

/** How `createJSONStorage` turns values into text and back. */
export interface JsonStorageOptions {
  /** Passed to `JSON.parse`. */
  reviver?: (key: string, value: unknown) => unknown;
  /** Passed to `JSON.stringify`. */
  replacer?: (key: string, value: unknown) => unknown;
}

/**
 * Options of `persist`.
 *
 * @template T - The state.
 * @template S - The persisted part of the state.
 */
export interface PersistOptions<T, S = T> {
  /** The key in the storage. It must be unique to the store. */
  name: string;
  /** Where to keep the state. Defaults to `localStorage` as JSON. */
  storage?: PersistStorage<S> | undefined;
  /** Picks what to persist. Defaults to the whole state. */
  partialize?: (state: T) => S;
  /** The version of the persisted shape. A stored state with another version is not used unless `migrate` converts it. */
  version?: number;
  /** Converts a state that was stored with another version. */
  migrate?: (persisted: unknown, version: number) => S | Promise<S>;
  /** Combines the stored state with the current one. Defaults to a shallow merge. */
  merge?: (persisted: unknown, current: T) => T;
  /** Does not read the storage when the store is created; call `store.persist.rehydrate()` yourself. */
  skipHydration?: boolean;
  /** Called before the state is read, and returns a function to call after it. */
  onRehydrateStorage?: (state: T) => ((state: T | undefined, error?: unknown) => void) | void;
}

/** The functions that `persist` adds to the store, as `store.persist`. */
export interface PersistApi<T, S = T> {
  /**
   * Reads the options.
   *
   * @returns The options.
   */
  getOptions(): PersistOptions<T, S>;
  /**
   * Changes some of the options.
   *
   * @param options - The options to change.
   */
  setOptions(options: Partial<PersistOptions<T, S>>): void;
  /**
   * Removes the stored state.
   *
   * @returns Nothing, or a promise of it.
   */
  clearStorage(): unknown;
  /**
   * Reads the storage and applies what it holds to the state.
   *
   * @returns A promise that settles when the state is applied.
   */
  rehydrate(): Promise<void>;
  /**
   * Tells whether the state has been read from the storage.
   *
   * @returns `true` after hydration.
   */
  hasHydrated(): boolean;
  /**
   * Calls a listener when hydration starts.
   *
   * @param listener - Receives the state.
   * @returns A function that stops the listener.
   */
  onHydrate(listener: (state: T) => void): () => void;
  /**
   * Calls a listener when hydration ends.
   *
   * @param listener - Receives the state.
   * @returns A function that stops the listener.
   */
  onFinishHydration(listener: (state: T) => void): () => void;
}

/**
 * Runs a function on a value, or on the value a promise resolves to, and stays synchronous for plain values so that
 * synchronous storages hydrate before the store is returned.
 *
 * @template A - The type of the value.
 * @template B - The type of the result.
 * @param value - A value or a promise of it.
 * @param next - What to do with it.
 * @returns The result, or a promise of it.
 */
const chain = <A, B>(value: A | Promise<A>, next: (resolved: A) => B | Promise<B>) =>
  value instanceof Promise ? value.then(next) : next(value);

/**
 * Makes a storage of JSON from a storage of strings. The storage is looked up when it is first needed, which
 * lets the code run where the storage does not exist.
 *
 * @example
 * persist(creator, { name: 'cart', storage: createJSONStorage(() => sessionStorage) });
 *
 * @template S - The persisted part of the state.
 * @param getStorage - Returns the string storage.
 * @param options - How to turn values into text and back.
 * @returns The storage, or `undefined` if the string storage is not available.
 */
export const createJSONStorage = <S>(
  getStorage: () => StateStorage,
  options?: JsonStorageOptions,
): PersistStorage<S> | undefined => {
  let storage: StateStorage;
  try {
    storage = getStorage();
  } catch {
    return undefined;
  }
  /**
   * Reads and parses a stored value.
   *
   * @param name - The key.
   * @returns The value, `null` if there is none, or a promise of either.
   */
  const getItem = (name: string) =>
    chain(storage.getItem(name), (text) =>
      text === null ? null : (JSON.parse(text, options?.reviver) as StorageValue<S>),
    );

  /**
   * Writes a value as JSON.
   *
   * @param name - The key.
   * @param value - The value.
   * @returns Nothing, or a promise of it.
   */
  const setItem = (name: string, value: StorageValue<S>) =>
    storage.setItem(name, JSON.stringify(value, options?.replacer));

  /**
   * Removes a value.
   *
   * @param name - The key.
   * @returns Nothing, or a promise of it.
   */
  const removeItem = (name: string) => storage.removeItem(name);

  return { getItem, setItem, removeItem };
};

/**
 * Keeps part of the state in a storage: reads it when the store is created and writes it after every change.
 * The initial state is not written until the first change.
 *
 * @example
 * const cart = createStore(
 *   persist<{ items: string[] }>(() => ({ items: [] }), { name: 'cart' }),
 * );
 *
 * @template T - The state.
 * @template S - The persisted part of the state.
 * @param creator - Builds the initial state.
 * @param initialOptions - Where and what to persist.
 * @returns A creator for `createStore`. The store gets a `persist` property.
 */
export const persist =
  <T, S = T>(creator: StateCreator<T>, initialOptions: PersistOptions<T, S>): StateCreator<T> =>
  (set, get, api) => {
    let options: PersistOptions<T, S> = { ...initialOptions };
    let storage = options.storage ?? createJSONStorage<S>(() => localStorage);
    let hydrated = false;
    const hydrateListeners = new Set<(state: T) => void>();
    const finishListeners = new Set<(state: T) => void>();
    const change = set as (...args: unknown[]) => void;

    /**
     * Picks the persisted part of the state.
     *
     * @param state - The state.
     * @returns What to write.
     */
    const pick = (state: T): S =>
      options.partialize ? options.partialize(state) : (state as unknown as S);

    /**
     * Writes the persisted part of the state.
     *
     * @returns Nothing, or a promise of it.
     */
    const write = () =>
      storage?.setItem(options.name, { state: pick(get()), version: options.version ?? 0 });

    /**
     * Changes the state, then writes it.
     *
     * @param partial - The change, or a function that returns it.
     * @param replace - Whether to replace the state instead of merging into it.
     * @param action - A name for the change.
     */
    const save = ((partial: never, replace?: boolean, action?: string) => {
      change(partial, replace, action);
      void write();
    }) as SetState<T>;
    api.setState = save;

    /**
     * Applies a state that was read, merging it with the current one.
     *
     * @param persisted - The stored state, or `undefined` if there was none.
     * @param migrated - Whether the state was converted and has to be written again.
     * @returns Nothing, or a promise of the write.
     */
    const apply = (persisted: unknown, migrated: boolean) => {
      if (persisted !== undefined) {
        const merge =
          options.merge ?? ((stored, current) => ({ ...current, ...(stored as object) }));
        change(merge(persisted, get()), true);
      }
      return migrated ? write() : undefined;
    };

    /**
     * Decides what to do with a stored value: use it, convert it or ignore it.
     *
     * @param stored - The stored value, or `null`.
     * @returns Nothing, or a promise of the write after a conversion.
     */
    const restore = (stored: StorageValue<S> | null) => {
      if (!stored) return apply(undefined, false);
      const version = options.version ?? 0;
      if (typeof stored.version === 'number' && stored.version !== version) {
        return options.migrate
          ? chain(options.migrate(stored.state, stored.version), (state) => apply(state, true))
          : apply(undefined, false);
      }
      return apply(stored.state, false);
    };

    /**
     * Reads the storage and applies the result.
     *
     * @returns A promise that settles when the state is applied.
     */
    const hydrate = (): Promise<void> => {
      hydrated = false;
      hydrateListeners.forEach((listener) => listener(get()));
      const after = options.onRehydrateStorage?.(get());
      let result: unknown;
      try {
        result = chain(storage?.getItem(options.name) ?? null, restore);
      } catch (error) {
        after?.(undefined, error);
        hydrated = true;
        return Promise.resolve();
      }
      /**
       * Marks hydration as finished and tells the listeners.
       */
      const finish = () => {
        after?.(get());
        hydrated = true;
        finishListeners.forEach((listener) => listener(get()));
      };
      if (result instanceof Promise) {
        return result.then(finish, (error: unknown) => {
          after?.(undefined, error);
        });
      }
      finish();
      return Promise.resolve();
    };

    /**
     * Adds a listener to a set and returns the function that removes it.
     *
     * @param listeners - The set.
     * @param listener - The listener.
     * @returns A function that removes the listener.
     */
    const listen = (listeners: Set<(state: T) => void>, listener: (state: T) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    };

    /**
     * Reads the options.
     *
     * @returns The options.
     */
    const getOptions = () => options;

    /**
     * Changes some of the options.
     *
     * @param next - The options to change.
     */
    const setOptions = (next: Partial<PersistOptions<T, S>>) => {
      options = { ...options, ...next };
      if (next.storage) storage = next.storage;
    };

    /**
     * Removes the stored state.
     *
     * @returns Nothing, or a promise of it.
     */
    const clearStorage = () => storage?.removeItem(options.name);

    /**
     * Tells whether the state has been read from the storage.
     *
     * @returns `true` after hydration.
     */
    const hasHydrated = () => hydrated;

    /**
     * Calls a listener when hydration starts.
     *
     * @param listener - Receives the state.
     * @returns A function that stops the listener.
     */
    const onHydrate = (listener: (state: T) => void) => listen(hydrateListeners, listener);

    /**
     * Calls a listener when hydration ends.
     *
     * @param listener - Receives the state.
     * @returns A function that stops the listener.
     */
    const onFinishHydration = (listener: (state: T) => void) => listen(finishListeners, listener);

    (api as { persist?: PersistApi<T, unknown> }).persist = {
      getOptions,
      setOptions,
      clearStorage,
      rehydrate: hydrate,
      hasHydrated,
      onHydrate,
      onFinishHydration,
    } as unknown as PersistApi<T, unknown>;

    const state = creator(save, get, api);
    if (!options.skipHydration) api.onReady(() => void hydrate());
    return state;
  };
