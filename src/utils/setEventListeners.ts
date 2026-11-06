import type { ResolvedProps } from '../types';
import { warn } from './warn';

type Reporter = (error: unknown, event: string) => void;

const rethrow: Reporter = (error) => {
  throw error;
};

const guarded =
  (handler: EventListener, event: string, onError: Reporter): EventListener =>
  (nativeEvent) => {
    try {
      handler(nativeEvent);
    } catch (error) {
      onError(error, event);
    }
  };

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
