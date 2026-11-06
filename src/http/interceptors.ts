/**
 * An interceptor: what to do with a value that passes, and with an error.
 *
 * @template V - The type of the value: a request config or a response.
 */
export interface InterceptorHandler<V> {
  /** Receives the value and returns it, changed or not, or a promise of it. */
  fulfilled?: ((value: V) => V | Promise<V>) | undefined;
  /** Receives an error and returns a value to recover, or throws. */
  rejected?: ((error: unknown) => unknown) | undefined;
  /** Skips the interceptor when it returns `false`. For request interceptors. */
  runWhen?: ((value: V) => boolean) | undefined;
}

/** Options of `use`. */
export interface InterceptorOptions<V> {
  /** Skips the interceptor when it returns `false`. Applies to request interceptors. */
  runWhen?: (value: V) => boolean;
}

/**
 * A list of interceptors that can be added, ejected and cleared.
 *
 * @template V - The type of the value: a request config or a response.
 */
export class InterceptorManager<V> {
  readonly #handlers = new Map<number, InterceptorHandler<V>>();
  #next = 0;

  /**
   * Adds an interceptor.
   *
   * @param fulfilled - Receives the value and returns it, changed or not.
   * @param rejected - Receives an error and returns a value to recover, or throws.
   * @param options - `runWhen` to skip the interceptor for some requests.
   * @returns The id, to pass to `eject`.
   */
  use(
    fulfilled?: InterceptorHandler<V>['fulfilled'],
    rejected?: InterceptorHandler<V>['rejected'],
    options?: InterceptorOptions<V>,
  ) {
    const id = this.#next++;
    this.#handlers.set(id, { fulfilled, rejected, runWhen: options?.runWhen });
    return id;
  }

  /**
   * Removes an interceptor. An id that is unknown or was already ejected does nothing.
   *
   * @param id - The id that `use` returned.
   */
  eject(id: number) {
    this.#handlers.delete(id);
  }

  /** Removes every interceptor. */
  clear() {
    this.#handlers.clear();
  }

  /**
   * Lists the interceptors in the order they were added.
   *
   * @returns The handlers.
   */
  list() {
    return [...this.#handlers.values()];
  }
}
