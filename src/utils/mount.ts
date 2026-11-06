/**
 * Appends nodes to a container, given as a selector or an element.
 *
 * @example
 * mount('#app', header, content);
 *
 * @param target - A CSS selector or an element.
 * @param nodes - The nodes to append, usually components.
 * @returns The container.
 * @throws {Error} If a selector matches nothing.
 */
export const mount = (target: string | Element, ...nodes: Node[]) => {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) throw new Error(`ecmact: mount target "${target}" not found`);
  container.append(...nodes);
  return container;
};
