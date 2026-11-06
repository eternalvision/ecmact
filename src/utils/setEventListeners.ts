import type { ResolvedProps } from '@em/types';
import { warn } from '@em/utils/warn';

/**
 * Receives an error thrown by an event listener.
 *
 * @param error - The error.
 * @param event - The lowercase event name.
 */
type Reporter = (error: unknown, event: string) => void;

/**
 * The default reporter: lets the error propagate.
 *
 * @param error - The error thrown by a handler.
 */
const rethrow: Reporter = (error) => {
  throw error;
};

/** The listeners that were attached in the capture phase, needed to remove them. */
const captured = new WeakSet<EventListener>();

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
 * Tells whether a prop value is a handler with options.
 *
 * @param value - The prop value.
 * @returns `true` for an object with a function `handler`.
 */
const isDescriptor = (
  value: unknown,
): value is { handler: EventListener; capture?: boolean; passive?: boolean } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { handler?: unknown }).handler === 'function';

/**
 * Attaches the `on<event>` handlers from the props and removes the ones attached before.
 * A handler is a function, or an object with a `handler` and the `capture` and `passive` options.
 * Other values are skipped, with a warning unless they are empty.
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
  previous.forEach((listener, event) =>
    element.removeEventListener(event, listener, captured.has(listener)),
  );

  const next = new Map<string, EventListener>();
  const options = new Map<string, AddEventListenerOptions>();

  Object.entries(props).forEach(([key, value]) => {
    if (!key.startsWith('on')) return;
    const event = key.slice(2).toLowerCase();
    if (typeof value === 'function') {
      next.set(event, guarded(value as EventListener, event, onError));
    } else if (isDescriptor(value)) {
      const { handler, capture, passive } = value;
      const listener = guarded(handler, event, onError);
      next.set(event, listener);
      options.set(event, { capture: capture === true, passive });
      if (capture === true) captured.add(listener);
    } else if (value !== undefined && value !== null && value !== false) {
      warn(`handler "${key}" is not a function and was ignored`);
    }
  });

  next.forEach((listener, event) => element.addEventListener(event, listener, options.get(event)));

  return next;
};
