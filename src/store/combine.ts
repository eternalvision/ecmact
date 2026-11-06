import type { SetState, StateCreator, Store } from '@em/store/store';

/**
 * Creates the state from an initial object and a creator that adds the actions, so that the types of the values
 * are inferred and only the actions need to be written out.
 *
 * @example
 * const counter = createStore(
 *   combine({ count: 0 }, (set) => ({ inc: () => set((state) => ({ count: state.count + 1 })) })),
 * );
 *
 * @template T - The initial values.
 * @template U - What the creator adds.
 * @param initial - The initial values.
 * @param creator - Builds the rest of the state.
 * @returns A creator for `createStore`.
 */
export const combine =
  <T extends object, U extends object>(
    initial: T,
    creator: (set: SetState<T>, get: () => T, api: Store<T>) => U,
  ): StateCreator<T & U> =>
  (set, get, api) => ({
    ...initial,
    ...creator(set as unknown as SetState<T>, get, api as unknown as Store<T>),
  });
