export const mount = (elementId: string, ...nodes: Node[]) => {
  const container = document.querySelector(elementId);
  if (container) container.append(...nodes);
};
