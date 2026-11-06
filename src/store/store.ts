import { batch, computed, signal, type ReadonlySignal } from '@em/signals/signals';
import type { PersistApi } from '@em/store/persist';

/**
 * Changes the state. A function receives the current state and returns the change. An object is shallow-merged
 * into the state, unless `replace` is `true` (the state is then replaced as a whole) or the state is not an
 * object (it is replaced). Nothing is notified when the new state is the same value as the old one.
 *
 * @template T - The state.
 */
export interface SetState<T> {
  /**
   * Merges a change into the state.
   *
   * @param partial - The change, or a function that returns it.
   * @param replace - `false` or omitted to merge.
   * @param action - A name for the change, which `devtools` shows.
   */
  (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: false,
    action?: string,
  ): void;
  /**
   * Replaces the state.
   *
   * @param state - The new state, or a function that returns it.
   * @param replace - `true` to replace.
   * @param action - A name for the change, which `devtools` shows.
   */
  (state: T | ((state: T) => T), replace: true, action?: string): void;
}

/**
 * Receives the new state and the one before it.
 *
 * @template T - The state.
 * @param state - The state after the change.
 * @param previous - The state before the change.
 */
export type Listener<T> = (state: T, previous: T) => void;

/**
 * Options of `watch`.
 *
 * @template U - The selected value.
 */
export interface WatchOptions<U> {
  /** Tells whether two selected values are the same. Defaults to `Object.is`. */
  equalityFn?: (a: U, b: U) => boolean;
  /** Calls the listener right away with the current value. */
  fireImmediately?: boolean;
}

/**
 * A store: a state, the ways to change it and to follow it.
 *
 * @template T - The state.
 */
export interface Store<T> {
  /** The state as a signal, so that components and effects can follow it. */
  readonly state: ReadonlySignal<T>;
  /** Added by `persist`: reads and writes the stored state. */
  readonly persist?: PersistApi<T, unknown>;
  /**
   * Reads the current state.
   *
   * @returns The state.
   */
  getState(): T;
  /**
   * Reads the state the store was created with.
   *
   * @returns The initial state.
   */
  getInitialState(): T;
  /** Changes the state. */
  setState: SetState<T>;
  /**
   * Calls a listener after every change.
   *
   * @param listener - Receives the new and the previous state.
   * @returns A function that stops the listener.
   */
  subscribe(listener: Listener<T>): () => void;
  /**
   * Calls a listener when a part of the state changes.
   *
   * @template U - The selected value.
   * @param selector - Picks the part.
   * @param listener - Receives the new and the previous value.
   * @param options - How to compare the values and whether to call the listener at once.
   * @returns A function that stops the listener.
   */
  watch<U>(
    selector: (state: T) => U,
    listener: (selected: U, previous: U) => void,
    options?: WatchOptions<U>,
  ): () => void;
  /**
   * Derives a signal from a part of the state. The signal changes only when the selected value does, so props
   * bound to it update only then.
   *
   * @template U - The selected value.
   * @param selector - Picks the part.
   * @param equalityFn - Tells whether two selected values are the same. Defaults to `Object.is`.
   * @returns The signal.
   */
  select<U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): ReadonlySignal<U>;
  /**
   * Runs a callback once the state exists: at once for a store that is created, otherwise right after the
   * creator returns. For middleware, which cannot touch the state while the creator is still running.
   *
   * @param callback - What to run.
   */
  onReady(callback: () => void): void;
}

/**
 * Builds the initial state. It receives the functions that change and read the state.
 *
 * @template T - The state.
 * @param set - Changes the state. Call it after the store is created, for example in an action.
 * @param get - Reads the state. Call it after the store is created.
 * @param api - The store, for middleware.
 * @returns The initial state.
 */
export type StateCreator<T> = (set: SetState<T>, get: () => T, api: Store<T>) => T;

/**
 * Creates a store. The state can be anything: usually an object with values and the actions that change them.
 *
 * @example
 * const counter = createStore<{ count: number; inc: () => void }>((set) => ({
 *   count: 0,
 *   inc: () => set((state) => ({ count: state.count + 1 })),
 * }));
 * counter.getState().inc();
 *
 * @template T - The state.
 * @param creator - Builds the initial state.
 * @returns The store.
 */
export const createStore = <T>(creator: StateCreator<T>): Store<T> => {
  let state!: T;
  let created = false;
  const listeners = new Set<Listener<T>>();
  const pending: (() => void)[] = [];
  const mirror = signal<T>(undefined as T);

  /**
   * Changes the state and tells the listeners.
   *
   * @param partial - The change, or a function that returns it.
   * @param replace - Whether to replace the state instead of merging into it.
   */
  const setState = ((partial: unknown, replace?: boolean) => {
    const next =
      typeof partial === 'function' ? (partial as (value: T) => unknown)(state) : partial;
    if (Object.is(next, state)) return;
    const previous = state;
    state = (
      (replace ?? (typeof next !== 'object' || next === null))
        ? next
        : { ...state, ...(next as object) }
    ) as T;
    batch(() => {
      mirror.value = state;
    });
    [...listeners].forEach((listener) => listener(state, previous));
  }) as SetState<T>;

  /**
   * Reads the current state.
   *
   * @returns The state.
   */
  const getState = () => state;

  /**
   * Reads the state the store was created with.
   *
   * @returns The initial state.
   */
  const getInitialState = () => initial;

  const store: Store<T> = {
    state: mirror,
    getState,
    getInitialState,
    setState,
    /**
     * Calls a listener after every change.
     *
     * @param listener - Receives the new and the previous state.
     * @returns A function that stops the listener.
     */
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /**
     * Calls a listener when a part of the state changes.
     *
     * @param selector - Picks the part.
     * @param listener - Receives the new and the previous value.
     * @param options - How to compare the values and whether to call the listener at once.
     * @returns A function that stops the listener.
     */
    watch: (selector, listener, { equalityFn = Object.is, fireImmediately = false } = {}) => {
      let current = selector(state);
      if (fireImmediately) listener(current, current);
      return store.subscribe((next) => {
        const selected = selector(next);
        if (equalityFn(selected, current)) return;
        const previous = current;
        current = selected;
        listener(selected, previous);
      });
    },
    /**
     * Derives a signal from a part of the state.
     *
     * @param selector - Picks the part.
     * @param equalityFn - Tells whether two selected values are the same.
     * @returns The signal.
     */
    select: (selector, equalityFn = Object.is) =>
      computed(() => selector(mirror.value), equalityFn),
    /**
     * Runs a callback once the state exists.
     *
     * @param callback - What to run.
     */
    onReady: (callback) => {
      if (created) callback();
      else pending.push(callback);
    },
  } as Store<T>;

  state = creator(setState, getState, store);
  const initial = state;
  mirror.value = state;
  created = true;
  pending.splice(0).forEach((callback) => callback());
  return store;
};
