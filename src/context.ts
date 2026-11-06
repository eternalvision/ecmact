/**
 * A context key. Providers offer a value for it, consumers look the value up.
 *
 * @template T - The type of the value the context carries.
 */
export interface Context<T> {
  /** A unique identity; contexts are compared by it, not by name. */
  readonly id: symbol;
  /** A name for debugging. */
  readonly name: string;
  /** Only carries the value type for TypeScript; it is never set. */
  readonly type?: T;
}

/** A value offered for a context, created with `provide`. */
export interface Provision {
  /** The context the value is offered for. */
  readonly context: Context<unknown>;
  /** The value consumers receive. */
  readonly value: unknown;
}

/** The detail of the event a consumer dispatches to find a provider. */
export interface ContextRequest {
  /** The context being asked for. */
  context: Context<unknown>;
  /** The element that asks. A provider ignores requests from itself. */
  host: Element;
  /**
   * Called by the provider that answers.
   *
   * @param value - The provided value.
   */
  respond: (value: unknown) => void;
}

/** The name of the event that carries context requests up the tree. */
export const contextRequestEvent = 'ecmact:context-request';

/**
 * Creates a context key that identifies a value offered by providers.
 * Two contexts with the same name are still different contexts.
 *
 * @example
 * const Theme = createContext<Signal<string>>('theme');
 *
 * @template T - The type of the value the context carries.
 * @param name - A name for debugging.
 * @returns The context key.
 */
export const createContext = <T>(name: string): Context<T> => ({ id: Symbol(name), name });

/**
 * Pairs a context with a value. Pass a list of these to the `provide` prop of a component.
 *
 * @template T - The type of the value.
 * @param context - The context to provide.
 * @param value - The value that consumers receive.
 * @returns A provision.
 */
export const provide = <T>(context: Context<T>, value: T): Provision => ({
  context: context as Context<unknown>,
  value,
});

/**
 * Looks up the value of a context from the nearest provider above an element.
 * The lookup is synchronous, so call it once the element is inside its tree, for example in `mounted`.
 *
 * @example
 * const theme = consume(Theme, component);
 *
 * @template T - The type of the value the context carries.
 * @param context - The context to read.
 * @param host - The element to start the lookup from.
 * @returns The provided value, or `undefined` if there is no provider.
 */
export const consume = <T>(context: Context<T>, host: Element): T | undefined => {
  let found: { value: T } | undefined;
  const detail: ContextRequest = {
    context: context as Context<unknown>,
    host,
    /**
     * Called by a provider with the value of the context.
     *
     * @param value - The provided value.
     */
    respond: (value) => {
      found = { value: value as T };
    },
  };
  host.dispatchEvent(
    new CustomEvent<ContextRequest>(contextRequestEvent, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  return found?.value;
};
