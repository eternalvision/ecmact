import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  batch,
  computed,
  effect,
  isSignal,
  signal,
  untracked,
  type ReadonlySignal,
  type Signal,
} from '@em/signals';

describe('signal', () => {
  it('holds a value', () => {
    const count = signal(1);
    expect(count.value).toBe(1);
    count.value = 2;
    expect(count.value).toBe(2);
    expect(count.peek()).toBe(2);
  });

  it('does not notify when the value is the same', () => {
    const count = signal(1);
    const run = vi.fn(() => void count.value);
    effect(run);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('treats NaN as equal to NaN', () => {
    const value = signal(NaN);
    const run = vi.fn(() => void value.value);
    effect(run);
    value.value = NaN;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('peek does not subscribe', () => {
    const count = signal(1);
    const run = vi.fn(() => void count.peek());
    effect(run);
    count.value = 2;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('is typed as writable', () => {
    expectTypeOf(signal(1)).toEqualTypeOf<Signal<number>>();
    expectTypeOf(signal('a').value).toEqualTypeOf<string>();
  });
});

describe('effect', () => {
  it('runs immediately and again when a dependency changes', () => {
    const count = signal(0);
    const seen: number[] = [];
    effect(() => void seen.push(count.value));
    count.value = 1;
    count.value = 2;
    expect(seen).toEqual([0, 1, 2]);
  });

  it('stops after dispose and ignores a second dispose', () => {
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    const dispose = effect(run);
    dispose();
    dispose();
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('runs the returned cleanup before each rerun and on dispose', () => {
    const count = signal(0);
    const cleanup = vi.fn();
    const dispose = effect(() => {
      void count.value;
      return cleanup;
    });
    expect(cleanup).not.toHaveBeenCalled();
    count.value = 1;
    expect(cleanup).toHaveBeenCalledTimes(1);
    dispose();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('works when the effect returns nothing', () => {
    const count = signal(0);
    const dispose = effect(() => void count.value);
    count.value = 1;
    expect(() => dispose()).not.toThrow();
  });

  it('tracks dependencies dynamically', () => {
    const flag = signal(true);
    const a = signal('a');
    const b = signal('b');
    const run = vi.fn(() => void (flag.value ? a.value : b.value));
    effect(run);
    b.value = 'b2';
    expect(run).toHaveBeenCalledTimes(1);
    flag.value = false;
    expect(run).toHaveBeenCalledTimes(2);
    a.value = 'a2';
    expect(run).toHaveBeenCalledTimes(2);
    b.value = 'b3';
    expect(run).toHaveBeenCalledTimes(3);
  });

  it('can be nested without leaking tracking to the outer effect', () => {
    const outer = signal(0);
    const inner = signal(0);
    const innerRun = vi.fn(() => void inner.value);
    const outerRun = vi.fn(() => {
      void outer.value;
      effect(innerRun);
    });
    effect(outerRun);
    inner.value = 1;
    expect(outerRun).toHaveBeenCalledTimes(1);
    expect(innerRun).toHaveBeenCalledTimes(2);
  });

  it('runs every effect and rethrows the first error', () => {
    const count = signal(0);
    const later = vi.fn(() => void count.value);
    effect(() => {
      if (count.value > 0) throw new Error('first');
    });
    effect(() => {
      if (count.value > 0) throw new Error('second');
    });
    effect(later);
    expect(() => (count.value = 1)).toThrow('first');
    expect(later).toHaveBeenCalledTimes(2);
  });

  it('can still run after an error', () => {
    const count = signal(0);
    const seen: number[] = [];
    effect(() => {
      seen.push(count.value);
      if (count.value === 1) throw new Error('boom');
    });
    expect(() => (count.value = 1)).toThrow('boom');
    count.value = 2;
    expect(seen).toEqual([0, 1, 2]);
  });

  it('stops an effect that keeps triggering itself', () => {
    const count = signal(0);
    expect(() =>
      effect(() => {
        void count.value;
        count.value = count.peek() + 1;
      }),
    ).toThrow('did not settle');
  });

  it('lets an effect update other signals', () => {
    const source = signal(1);
    const target = signal(0);
    effect(() => {
      target.value = source.value * 2;
    });
    source.value = 5;
    expect(target.value).toBe(10);
  });
});

describe('computed', () => {
  it('derives a value lazily and memoizes it', () => {
    const count = signal(2);
    const fn = vi.fn(() => count.value * 2);
    const double = computed(fn);
    expect(fn).not.toHaveBeenCalled();
    expect(double.value).toBe(4);
    expect(double.value).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
    count.value = 3;
    expect(double.value).toBe(6);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('peek reads without subscribing', () => {
    const count = signal(1);
    const double = computed(() => count.value * 2);
    const run = vi.fn(() => void double.peek());
    effect(run);
    count.value = 2;
    expect(run).toHaveBeenCalledTimes(1);
    expect(double.peek()).toBe(4);
  });

  it('chains', () => {
    const count = signal(1);
    const double = computed(() => count.value * 2);
    const label = computed(() => `value ${double.value}`);
    expect(label.value).toBe('value 2');
    count.value = 2;
    expect(label.value).toBe('value 4');
  });

  it('notifies effects once for a diamond', () => {
    const source = signal(1);
    const left = computed(() => source.value + 1);
    const right = computed(() => source.value * 2);
    const run = vi.fn(() => void (left.value + right.value));
    effect(run);
    source.value = 2;
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not notify again while it is already dirty', () => {
    const a = signal(1);
    const b = signal(1);
    const sum = computed(() => a.value + b.value);
    const run = vi.fn(() => void sum.value);
    effect(run);
    batch(() => {
      a.value = 2;
      b.value = 2;
    });
    expect(run).toHaveBeenCalledTimes(2);
    expect(sum.value).toBe(4);
  });

  it('drops dependencies it no longer reads', () => {
    const flag = signal(true);
    const a = signal(1);
    const b = signal(2);
    const fn = vi.fn(() => (flag.value ? a.value : b.value));
    const picked = computed(fn);
    expect(picked.value).toBe(1);
    flag.value = false;
    expect(picked.value).toBe(2);
    a.value = 10;
    expect(picked.value).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('is typed as read only', () => {
    expectTypeOf(computed(() => 1)).toEqualTypeOf<ReadonlySignal<number>>();
  });
});

describe('subscribe', () => {
  it('calls the listener immediately and on changes', () => {
    const count = signal(0);
    const listener = vi.fn();
    count.subscribe(listener);
    count.value = 1;
    expect(listener.mock.calls).toEqual([[0], [1]]);
  });

  it('stops after unsubscribe', () => {
    const count = signal(0);
    const listener = vi.fn();
    const unsubscribe = count.subscribe(listener);
    unsubscribe();
    count.value = 1;
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not track signals read inside the listener', () => {
    const count = signal(0);
    const other = signal(0);
    const listener = vi.fn(() => void other.value);
    count.subscribe(listener);
    other.value = 1;
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('works on computed signals', () => {
    const count = signal(1);
    const double = computed(() => count.value * 2);
    const listener = vi.fn();
    double.subscribe(listener);
    count.value = 2;
    expect(listener.mock.calls).toEqual([[2], [4]]);
  });

  it('does not track signals read inside a computed listener', () => {
    const count = signal(1);
    const other = signal(0);
    const double = computed(() => count.value * 2);
    const listener = vi.fn(() => void other.value);
    double.subscribe(listener);
    other.value = 1;
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('batch', () => {
  it('runs effects once after the batch', () => {
    const a = signal(1);
    const b = signal(1);
    const run = vi.fn(() => void (a.value + b.value));
    effect(run);
    batch(() => {
      a.value = 2;
      b.value = 2;
      expect(run).toHaveBeenCalledTimes(1);
    });
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('returns the result of the callback', () => {
    expect(batch(() => 42)).toBe(42);
  });

  it('flushes only when the outermost batch ends', () => {
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    effect(run);
    batch(() => {
      batch(() => {
        count.value = 1;
      });
      expect(run).toHaveBeenCalledTimes(1);
    });
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('flushes even when the callback throws', () => {
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    effect(run);
    expect(() =>
      batch(() => {
        count.value = 1;
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(run).toHaveBeenCalledTimes(2);
  });
});

describe('untracked', () => {
  it('reads without subscribing', () => {
    const count = signal(0);
    const run = vi.fn(() => void untracked(() => count.value));
    effect(run);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('returns the result and restores tracking', () => {
    const a = signal(0);
    const b = signal(0);
    const run = vi.fn(() => {
      expect(untracked(() => 7)).toBe(7);
      void b.value;
      void a.value;
    });
    effect(run);
    b.value = 1;
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('restores tracking when the callback throws', () => {
    const count = signal(0);
    const run = vi.fn(() => {
      expect(() =>
        untracked(() => {
          throw new Error('boom');
        }),
      ).toThrow('boom');
      void count.value;
    });
    effect(run);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(2);
  });
});

describe('isSignal', () => {
  it('recognizes signals and computed signals', () => {
    expect(isSignal(signal(1))).toBe(true);
    expect(isSignal(computed(() => 1))).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isSignal(null)).toBe(false);
    expect(isSignal(undefined)).toBe(false);
    expect(isSignal(1)).toBe(false);
    expect(isSignal('a')).toBe(false);
    expect(isSignal({ value: 1 })).toBe(false);
    expect(isSignal(() => 1)).toBe(false);
  });
});
