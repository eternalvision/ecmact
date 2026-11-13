import { currentNode } from '@em/render/bindings';
import { signal } from '@em/signals/signals';

/**
 * A context: a value that an element offers to everything below it, without handing it down through props.
 *
 * @template T - The type of the value the context carries.
 * @template F - The type of the value that `use` returns when nothing provides the context.
 */
export interface Context<T, F = undefined> {
  /** A unique identity; contexts are compared by it, not by name. */
  readonly id: symbol;
  /** A name for debugging. */
  readonly name: string;
  /**
   * Pairs the context with a value. Pass the result, or a list of them, to the `provide` prop of an element.
   *
   * @param value - The value that the elements below receive.
   * @returns A provision.
   */
  provide(value: T): Provision;
  /**
   * Reads the value from the nearest provider above a node. Inside a reactive function the node may be left
   * out: it is the element that the function belongs to, and the function runs again once that element is in
   * the document.
   *
   * @param node - The node to start the lookup from.
   * @returns The provided value, or the fallback of the context if there is no provider.
   */
  use(node?: Node): T | F;
}

/** A value offered for a context, created with `Context.provide`. */
export interface Provision {
  /** The context the value is offered for. */
  readonly context: Context<never, unknown>;
  /** The value consumers receive. */
  readonly value: unknown;
}

/** The detail of the event a consumer dispatches to find a provider. */
export interface ContextRequest {
  /** The context being asked for. */
  context: Context<never, unknown>;
  /** The node that asks. A provider ignores requests from itself. */
  host: Node;
  /**
   * Called by the provider that answers.
   *
   * @param value - The provided value.
   */
  respond: (value: unknown) => void;
}

/** Creates a context, with or without a fallback value. */
interface CreateContext {
  /**
   * Creates a context without a fallback: `use` returns `undefined` when nothing provides it.
   *
   * @template T - The type of the value the context carries.
   * @param name - A name for debugging.
   * @returns The context.
   */
  <T>(name: string): Context<T>;
  /**
   * Creates a context with a fallback, which `use` returns when nothing provides it.
   *
   * @template T - The type of the value the context carries.
   * @param name - A name for debugging.
   * @param fallback - The value to use without a provider.
   * @returns The context.
   */
  <T>(name: string, fallback: T): Context<T, T>;
}

/** The name of the event that carries context requests up the tree. */
export const contextRequestEvent = 'ecmact:context-request';

/** Changes whenever nodes are put into the document, so that lookups made too early run again. */
const attached = signal(0);

/**
 * Tells the reactive functions that looked for a context before their element was in the document to look again.
 * Called whenever the library puts nodes into the document.
 */
export const notifyAttached = () => {
  attached.value = attached.peek() + 1;
};

/**
 * Makes the reactive function that is running run again when nodes are put into the document. For code that
 * needs its element to be in the document and found that it is not there yet.
 */
export const trackAttached = () => {
  void attached.value;
};

/**
 * Asks the providers above a node for the value of a context.
 *
 * @param context - The context to read.
 * @param host - The node to start the lookup from.
 * @returns The answer of the nearest provider, wrapped so that a provided `undefined` can be told from no answer.
 */
const request = (context: Context<never, unknown>, host: Node) => {
  let found: { value: unknown } | undefined;
  const detail: ContextRequest = {
    context,
    host,
    /**
     * Called by a provider with the value of the context.
     *
     * @param value - The provided value.
     */
    respond: (value) => {
      found = { value };
    },
  };
  host.dispatchEvent(
    new CustomEvent<ContextRequest>(contextRequestEvent, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  return found;
};

/**
 * Creates a context. Two contexts with the same name are still different contexts.
 *
 * @example
 * const Accent = createContext<Signal<string>>('accent');
 * tags.div({ provide: Accent.provide(color) }, tags.p({ style: { color: () => Accent.use()?.value } }, 'text'));
 *
 * @param name - A name for debugging.
 * @param fallback - The value that `use` returns without a provider.
 * @returns The context.
 */
export const createContext: CreateContext = <T>(name: string, fallback?: T) => {
  const context: Context<T, T | undefined> = {
    id: Symbol(name),
    name,
    /**
     * Pairs the context with a value.
     *
     * @param value - The value that the elements below receive.
     * @returns A provision.
     */
    provide: (value) => ({ context: context as Context<never, unknown>, value }),
    /**
     * Reads the value from the nearest provider above a node.
     *
     * @param node - The node to start from; inside a reactive function, the element it belongs to.
     * @returns The provided value, or the fallback.
     * @throws {TypeError} If no node is given outside of a reactive function.
     */
    use: (node = currentNode() ?? undefined) => {
      if (!node) {
        throw new TypeError(
          `ecmact: context "${name}" needs a node: pass one to use(), or call it in a reactive function`,
        );
      }
      if (!node.isConnected) trackAttached();
      const found = request(context as Context<never, unknown>, node);
      return found ? (found.value as T) : fallback;
    },
  };
  return context;
};

/**
 * Makes an element answer the context requests that bubble through it, for the contexts it provides.
 * Requests that the element made itself are ignored, so it can read an outer value and offer a new one.
 *
 * @param element - The element with the `provide` prop.
 * @param provisions - The values it offers.
 */
export const offer = (element: Element, provisions: Provision[]) => {
  element.addEventListener(contextRequestEvent, (event) => {
    const { context, host, respond } = (event as CustomEvent<ContextRequest>).detail;
    if (host === element) return;
    const provision = provisions.find((candidate) => candidate.context === context);
    if (!provision) return;
    event.stopPropagation();
    respond(provision.value);
  });
};
