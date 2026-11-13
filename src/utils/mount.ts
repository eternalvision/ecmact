import { notifyAttached } from '@em/core/context';
import { appendChildren } from '@em/render/children';
import type { Child } from '@em/types';

/**
 * Appends children to a container, given as a selector or an element.
 *
 * @example
 * mount('#app', header, content);
 *
 * @param target - A CSS selector or an element.
 * @param children - What to append: nodes, text, lists, and signals or functions that are rendered again when they change.
 * @returns The container.
 * @throws {Error} If a selector matches nothing.
 */
export const mount = (target: string | Element, ...children: Child[]) => {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) throw new Error(`ecmact: mount target "${target}" not found`);
  appendChildren(container, children);
  notifyAttached();
  return container;
};
