import { describe, expect, it } from 'vitest';
import { combine } from '@em/store/combine';
import { createStore } from '@em/store/store';

describe('combine', () => {
  it('merges the initial values with what the creator adds', () => {
    const store = createStore(
      combine({ count: 0 }, (set) => ({
        inc: () => set((state) => ({ count: state.count + 1 })),
      })),
    );
    expect(store.getState().count).toBe(0);
    store.getState().inc();
    expect(store.getState().count).toBe(1);
  });

  it('passes get and the store to the creator', () => {
    let seen: unknown;
    const store = createStore(
      combine({ a: 1 }, (_set, get, api) => {
        seen = [typeof get, api];
        return { b: 2 };
      }),
    );
    expect(seen).toEqual(['function', store]);
    expect(store.getState()).toEqual({ a: 1, b: 2 });
  });
});
