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

const track = (source: Source) => {
  if (!active) return;
  source.subs.add(active);
  active.deps.add(source);
};

const unlink = (listener: Listener) => {
  listener.deps.forEach((source) => source.subs.delete(listener));
  listener.deps.clear();
};

const collect = <T>(listener: Listener, fn: () => T) => {
  const previous = active;
  active = listener;
  try {
    return fn();
  } finally {
    active = previous;
  }
};

const notify = (source: Source) => [...source.subs].forEach((listener) => listener.invalidate());

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

class SignalImpl<T> implements Signal<T>, Source {
  readonly [brand] = true;
  readonly subs = new Set<Listener>();
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value() {
    track(this);
    return this.#value;
  }

  set value(next: T) {
    if (Object.is(next, this.#value)) return;
    this.#value = next;
    notify(this);
    flush();
  }

  peek() {
    return this.#value;
  }

  subscribe(listener: (value: T) => void) {
    return effect(() => {
      const value = this.value;
      untracked(() => listener(value));
    });
  }
}

class ComputedImpl<T> implements ReadonlySignal<T>, Source, Listener {
  readonly [brand] = true;
  readonly subs = new Set<Listener>();
  readonly deps = new Set<Source>();
  readonly #fn: () => T;
  #value!: T;
  #dirty = true;

  constructor(fn: () => T) {
    this.#fn = fn;
  }

  get value() {
    track(this);
    return this.#read();
  }

  peek() {
    return this.#read();
  }

  invalidate() {
    if (this.#dirty) return;
    this.#dirty = true;
    notify(this);
  }

  subscribe(listener: (value: T) => void) {
    return effect(() => {
      const value = this.value;
      untracked(() => listener(value));
    });
  }

  #read() {
    if (this.#dirty) {
      unlink(this);
      this.#value = collect(this, this.#fn);
      this.#dirty = false;
    }
    return this.#value;
  }
}

class Effect implements Listener {
  readonly deps = new Set<Source>();
  readonly #fn: () => void | (() => void);
  #cleanup: (() => void) | void = undefined;
  #disposed = false;

  constructor(fn: () => void | (() => void)) {
    this.#fn = fn;
  }

  invalidate() {
    pending.add(this);
  }

  run() {
    this.#cleanup?.();
    unlink(this);
    this.#cleanup = collect(this, this.#fn);
  }

  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#cleanup?.();
    this.#cleanup = undefined;
    unlink(this);
    pending.delete(this);
  }
}

export const signal = <T>(value: T): Signal<T> => new SignalImpl(value);

export const computed = <T>(fn: () => T): ReadonlySignal<T> => new ComputedImpl(fn);

export const effect = (fn: () => void | (() => void)) => {
  const instance = new Effect(fn);
  instance.run();
  return () => instance.dispose();
};

export const batch = <T>(fn: () => T): T => {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    flush();
  }
};

export const untracked = <T>(fn: () => T): T => {
  const previous = active;
  active = null;
  try {
    return fn();
  } finally {
    active = previous;
  }
};

export const isSignal = (value: unknown): value is ReadonlySignal<unknown> =>
  typeof value === 'object' && value !== null && brand in value;
