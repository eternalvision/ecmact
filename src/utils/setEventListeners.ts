import type { ComponentProps } from '../types';

export const setEventListeners = (
  element: HTMLElement,
  props: ComponentProps,
  previous: Map<string, EventListener>,
) => {
  previous.forEach((listener, event) => element.removeEventListener(event, listener));

  const next = new Map<string, EventListener>();

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      next.set(key.slice(2).toLowerCase(), value as EventListener);
    }
  });

  next.forEach((listener, event) => element.addEventListener(event, listener));

  return next;
};
