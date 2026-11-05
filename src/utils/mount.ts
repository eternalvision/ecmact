export const mount = (target: string | Element, ...nodes: Node[]) => {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) throw new Error(`ecmact: mount target "${target}" not found`);
  container.append(...nodes);
  return container;
};
