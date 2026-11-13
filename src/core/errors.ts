import { getConfig, type ErrorHandler, type ErrorPhase } from '@em/core/config';

const handlers = new WeakMap<Node, ErrorHandler>();

/**
 * Makes an element receive the errors that come from it and from everything below it.
 *
 * @param element - The element with the `error` prop.
 * @param handler - The handler.
 */
export const catchErrors = (element: Element, handler: ErrorHandler) => {
  handlers.set(element, handler);
};

/**
 * Finds the nearest error handler at or above a node, crossing shadow roots.
 *
 * @param node - The node to start from.
 * @returns The handler of the nearest element that has one, or the configured one.
 */
const findHandler = (node: Node | null): ErrorHandler | undefined => {
  if (!node) return getConfig().onError;
  return handlers.get(node) ?? findHandler(node.parentNode ?? (node as ShadowRoot).host ?? null);
};

/**
 * Passes an error to the nearest `error` prop or to the configured handler, or rethrows it if there is none.
 *
 * @param error - The error.
 * @param element - The element it came from.
 * @param phase - Where it happened.
 * @param event - The event name, for the `event` phase.
 */
export const report = (error: unknown, element: Element, phase: ErrorPhase, event?: string) => {
  const handler = findHandler(element);
  if (!handler) throw error;
  handler(error, { element, phase, event });
};

/**
 * Runs `fn` and reports any error it throws.
 *
 * @template T - The result type of `fn`.
 * @param element - The element the call belongs to.
 * @param phase - Where `fn` is called from, for the report.
 * @param fn - The function to run.
 * @returns The result of `fn`, or `undefined` if it threw and the error was handled.
 */
export const guard = <T>(element: Element, phase: ErrorPhase, fn: () => T) => {
  try {
    return fn();
  } catch (error) {
    report(error, element, phase);
    return undefined;
  }
};
