import type { ResolvedProps } from '@em/types';
import { warn } from '@em/utils/warn';

type Reporter = (error: unknown, event: string) => void;

/**
 * The default reporter: lets the error propagate.
 *
 * @param error - The error thrown by a handler.
 */
const rethrow: Reporter = (error) => {
  throw error;
};

/**
 * Wraps a handler so that errors are reported instead of thrown.
 *
 * @param handler - The user's handler.
 * @param event - The lowercase event name.
 * @param onError - Receives the error.
 * @returns The listener to attach.
 */
const guarded =
  (handler: EventListener, event: string, onError: Reporter): EventListener =>
  (nativeEvent) => {
    try {
      handler(nativeEvent);
    } catch (error) {
      onError(error, event);
    }
  };

/**
 * Attaches the `on<event>` handlers from the props and removes the ones attached before.
 * Non-function values are skipped, with a warning unless they are empty.
 *
 * @param element - The element to attach to.
 * @param props - The props, where keys starting with `on` are handlers.
 * @param previous - The listeners attached by the previous call.
 * @param onError - Receives errors thrown by handlers. Without it they are rethrown.
 * @returns The attached listeners, to pass to the next call.
 */
export const setEventListeners = (
  element: HTMLElement,
  props: ResolvedProps,
  previous: Map<string, EventListener>,
  onError: Reporter = rethrow,
) => {
  previous.forEach((listener, event) => element.removeEventListener(event, listener));

  const next = new Map<string, EventListener>();

  Object.entries(props).forEach(([key, value]) => {
    if (!key.startsWith('on')) return;
    const event = key.slice(2).toLowerCase();
    if (typeof value === 'function') {
      next.set(event, guarded(value as EventListener, event, onError));
    } else if (value !== undefined && value !== null && value !== false) {
      warn(`handler "${key}" is not a function and was ignored`);
    }
  });

  next.forEach((listener, event) => element.addEventListener(event, listener));

  return next;
};
