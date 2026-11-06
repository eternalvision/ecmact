import { batch, effect, signal, untracked, type ReadonlySignal } from '@em/signals';

/** What the fetcher of a resource receives. */
export interface ResourceContext {
  /** Aborted when the request is replaced by a newer one or the resource is disposed. */
  signal: AbortSignal;
}

/**
 * Options of a resource.
 *
 * @template T - The type of the data.
 */
export interface ResourceOptions<T> {
  /** The data to expose until the first request finishes. */
  initial?: T;
}

/**
 * An async value exposed as signals.
 *
 * @template T - The type of the data.
 */
export interface Resource<T> {
  /** The latest result, or `undefined` (or the initial value) before the first one. */
  readonly data: ReadonlySignal<T | undefined>;
  /** The reason of the latest failure, or `undefined`. */
  readonly error: ReadonlySignal<unknown>;
  /** `true` while a request is in flight. */
  readonly loading: ReadonlySignal<boolean>;
  /** Runs the fetcher again. */
  refetch(): void;
  /**
   * Sets the data by hand and clears the error.
   *
   * @param value - The new data.
   */
  mutate(value: T): void;
  /** Stops reacting to signals, aborts the request in flight and ignores late results. */
  dispose(): void;
}

/**
 * Runs an async function and exposes its result as signals.
 * The function runs immediately and again whenever a signal it reads (before its first `await`) changes.
 * Only the latest request counts: older ones are aborted and their results ignored.
 *
 * @example
 * const user = resource(({ signal }) => fetch(`/api/users/${id.value}`, { signal }).then((r) => r.json()));
 *
 * @template T - The type of the result.
 * @param fetcher - Starts a request. It receives an `AbortSignal` for that request.
 * @param options - Options such as the initial value.
 * @returns The resource with `data`, `error` and `loading` signals and methods to control it.
 */
export const resource = <T>(
  fetcher: (context: ResourceContext) => T | Promise<T>,
  options: ResourceOptions<T> = {},
): Resource<T> => {
  const data = signal<T | undefined>(options.initial);
  const error = signal<unknown>(undefined);
  const loading = signal(false);
  let controller: AbortController | undefined;
  let current = 0;

  /**
   * Starts a request: aborts the previous one, marks the resource as loading and clears the error.
   */
  const load = () => {
    controller?.abort();
    const own = new AbortController();
    controller = own;
    const run = ++current;
    batch(() => {
      loading.value = true;
      error.value = undefined;
    });
    /**
     * Applies the outcome of a request, unless a newer request replaced it, and ends loading.
     *
     * @param apply - Writes the data or the error.
     */
    const settle = (apply: () => void) => {
      if (run !== current) return;
      batch(() => {
        apply();
        loading.value = false;
      });
    };
    new Promise<T>((resolve) => resolve(fetcher({ signal: own.signal }))).then(
      (value) => settle(() => (data.value = value)),
      (reason) => settle(() => (error.value = reason)),
    );
  };

  const stop = effect(load);

  return {
    data,
    error,
    loading,
    /**
     * Runs the fetcher again without subscribing the caller to anything.
     */
    refetch: () => {
      untracked(load);
    },
    /**
     * Sets the data by hand and clears the error.
     *
     * @param value - The new data.
     */
    mutate: (value) => {
      batch(() => {
        data.value = value;
        error.value = undefined;
      });
    },
    /**
     * Stops reacting to signals, aborts the request in flight and ignores late results.
     */
    dispose: () => {
      stop();
      controller?.abort();
      current++;
      loading.value = false;
    },
  };
};
