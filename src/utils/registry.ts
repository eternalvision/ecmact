const components = new WeakSet<object>();

/**
 * Remembers a node as a component created by this library.
 *
 * @param node - The component element.
 */
export const registerComponent = (node: object) => {
  components.add(node);
};

/**
 * Tells whether a node is a component created by this library.
 *
 * @param node - The value to check.
 * @returns `true` for components.
 */
export const isComponent = (node: unknown): node is HTMLElement =>
  typeof node === 'object' && node !== null && components.has(node);
