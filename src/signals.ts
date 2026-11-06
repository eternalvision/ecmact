export interface ReadonlySignal<T> {
  readonly value: T;
  peek(): T;
  subscribe(listener: (value: T) => void): () => void;
}

export interface Signal<T> extends ReadonlySignal<T> {
  value: T;
}

interface Listener {
  readonly deps: Set<Source>;
  invalidate(): void;
}

interface Source {
  readonly subs: Set<Listener>;
}

const brand = Symbol('ecmact.signal');
const maxRuns = 10000;

let active: Listener | null = null;
let batchDepth = 0;
let flushing = false;
const pending = new Set<Effect>();

/**
 * Records the active listener as a reader of `source`, so it is notified when the source changes.
 * Does nothing outside of an effect or a computed value.
 *
 * @param source - The signal or computed value that is being read.
 */
const track = (source: Source) => {
  if (!active) return;
  source.subs.add(active);
  active.deps.add(source);
};

/**
 * Detaches a listener from every source it depends on.
 *
 * @param listener - The effect or computed value to detach.
 */
const unlink = (listener: Listener) => {
  listener.deps.forEach((source) => source.subs.delete(listener));
  listener.deps.clear();
};

/**
 * Runs `fn` with `listener` as the active listener, so every signal read inside is recorded as
 * its dependency. The previous listener is restored afterwards, even if `fn` throws.
 *
 * @template T - The result type of `fn`.
 * @param listener - The effect or computed value collecting dependencies.
 * @param fn - The function to run.
 * @returns The result of `fn`.
 */
const collect = <T>(listener: Listener, fn: () => T) => {
  const previous = active;
  active = listener;
  try {
    return fn();
  } finally {
    active = previous;
  }
};

/**
 * Tells every listener of `source` that it changed.
 *
 * @param source - The signal or computed value that changed.
 */
const notify = (source: Source) => {
  [...source.subs].forEach((listener) => listener.invalidate());
};

/**
 * Runs the pending effects, unless a batch is open or a flush is already running.
 * Every effect runs even if another one throws, and the first error is rethrown at the end.
 * An effect set that keeps re-triggering itself is stopped with an error instead of looping forever.
 *
 * @throws {unknown} The first error thrown by an effect, or an error if the effects do not settle.
 */
const flush = () => {
  if (batchDepth > 0 || flushing) return;
  flushing = true;
  const errors: unknown[] = [];
  let runs = 0;
  try {
    for (const effect of pending) {
      pending.delete(effect);
      if (++runs > maxRuns) {
        pending.clear();
        errors.push(new Error('ecmact: effect did not settle, it keeps triggering itself'));
        break;
      }
      try {
        effect.run();
      } catch (error) {
        errors.push(error);
      }
    }
  } finally {
    flushing = false;
  }
  if (errors.length > 0) throw errors[0];
};

/**
 * A writable signal.
 *
 * @template T - The type of the value.
 */
class SignalImpl<T> implements Signal<T>, Source {
  readonly [brand] = true;
  readonly subs = new Set<Listener>();
  #value: T;

  /**
   * @param value - The initial value.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Reads the value and subscribes the active effect or computed value to changes.
   *
   * @returns The current value.
   */
  get value() {
    track(this);
    return this.#value;
  }

  /**
   * Writes the value. Writing the value the signal already holds (`Object.is`) does nothing;
   * otherwise the readers are notified and effects run, unless inside a batch.
   *
   * @param next - The new value.
   */
  set value(next: T) {
    if (Object.is(next, this.#value)) return;
    this.#value = next;
    notify(this);
    flush();
  }

  /**
   * Reads the value without subscribing to it.
   *
   * @returns The current value.
   */
  peek() {
    return this.#value;
  }

  /**
   * Calls `listener` with the current value now and again after every change.
   * Signals read inside `listener` are not tracked.
   *
   * @param listener - Receives the value.
   * @returns A function that stops the subscription.
   */
  subscribe(listener: (value: T) => void) {
    return effect(() => {
      const value = this.value;
      untracked(() => listener(value));
    });
  }
}

/**
 * A read-only signal derived from other signals. It is lazy and memoized.
 *
 * @template T - The type of the derived value.
 */
class ComputedImpl<T> implements ReadonlySignal<T>, Source, Listener {
  readonly [brand] = true;
  readonly subs = new Set<Listener>();
  readonly deps = new Set<Source>();
  readonly #fn: () => T;
  #value!: T;
  #dirty = true;

  /**
   * @param fn - Computes the value from other signals.
   */
  constructor(fn: () => T) {
    this.#fn = fn;
  }

  /**
   * Reads the derived value, recomputing it first if a dependency changed,
   * and subscribes the active effect or computed value to it.
   *
   * @returns The current value.
   */
  get value() {
    track(this);
    return this.#read();
  }

  /**
   * Reads the derived value without subscribing to it.
   *
   * @returns The current value.
   */
  peek() {
    return this.#read();
  }

  /**
   * Marks the value as stale and notifies its readers. Called when a dependency changes.
   */
  invalidate() {
    if (this.#dirty) return;
    this.#dirty = true;
    notify(this);
  }

  /**
   * Calls `listener` with the current value now and again after every change.
   * Signals read inside `listener` are not tracked.
   *
   * @param listener - Receives the value.
   * @returns A function that stops the subscription.
   */
  subscribe(listener: (value: T) => void) {
    return effect(() => {
      const value = this.value;
      untracked(() => listener(value));
    });
  }

  /**
   * Recomputes the value if it is stale, tracking its dependencies anew.
   *
   * @returns The current value.
   */
  #read() {
    if (this.#dirty) {
      unlink(this);
      this.#value = collect(this, this.#fn);
      this.#dirty = false;
    }
    return this.#value;
  }
}

/**
 * A function that runs again whenever a signal it read changes.
 */
class Effect implements Listener {
  readonly deps = new Set<Source>();
  readonly #fn: () => void | (() => void);
  #cleanup: (() => void) | void = undefined;
  #disposed = false;

  /**
   * @param fn - The effect body. It may return a cleanup function.
   */
  constructor(fn: () => void | (() => void)) {
    this.#fn = fn;
  }

  /**
   * Queues the effect to run again. Called when a dependency changes.
   */
  invalidate() {
    pending.add(this);
  }

  /**
   * Runs the previous cleanup, then the effect body, tracking its dependencies anew
   * and keeping the cleanup it returns.
   */
  run() {
    this.#cleanup?.();
    unlink(this);
    this.#cleanup = collect(this, this.#fn);
  }

  /**
   * Stops the effect: runs the last cleanup, detaches from its dependencies and leaves the queue.
   * Safe to call more than once.
   */
  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#cleanup?.();
    this.#cleanup = undefined;
    unlink(this);
    pending.delete(this);
  }
}

/**
 * Creates a writable signal.
 *
 * @example
 * const count = signal(0);
 * count.value++;
 *
 * @template T - The type of the value.
 * @param value - The initial value.
 * @returns The signal.
 */
export const signal = <T>(value: T): Signal<T> => new SignalImpl(value);

/**
 * Creates a read-only signal derived from other signals. It recomputes lazily when a dependency
 * changed and is memoized in between.
 *
 * @example
 * const double = computed(() => count.value * 2);
 *
 * @template T - The type of the derived value.
 * @param fn - Computes the value from other signals.
 * @returns The computed signal.
 */
export const computed = <T>(fn: () => T): ReadonlySignal<T> => new ComputedImpl(fn);

/**
 * Runs `fn` now and again whenever a signal it read changes. Dependencies are tracked anew on every run.
 * `fn` may return a cleanup that runs before the next run and when the effect is stopped.
 *
 * @example
 * const stop = effect(() => console.log(count.value));
 *
 * @param fn - The effect body.
 * @returns A function that stops the effect.
 */
export const effect = (fn: () => void | (() => void)) => {
  const instance = new Effect(fn);
  instance.run();
  return () => instance.dispose();
};

/**
 * Groups signal writes: effects run once, after the outermost `batch` returns.
 *
 * @template T - The result type of `fn`.
 * @param fn - The function that performs the writes.
 * @returns The result of `fn`.
 */
export const batch = <T>(fn: () => T): T => {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    flush();
  }
};

/**
 * Runs `fn` without subscribing the active effect or computed value to the signals it reads.
 *
 * @template T - The result type of `fn`.
 * @param fn - The function to run.
 * @returns The result of `fn`.
 */
export const untracked = <T>(fn: () => T): T => {
  const previous = active;
  active = null;
  try {
    return fn();
  } finally {
    active = previous;
  }
};

/**
 * Tells whether a value is a signal or a computed signal.
 *
 * @param value - The value to check.
 * @returns `true` for signals and computed signals.
 */
export const isSignal = (value: unknown): value is ReadonlySignal<unknown> =>
  typeof value === 'object' && value !== null && brand in value;
