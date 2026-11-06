const components = new WeakSet<object>();

export const registerComponent = (node: object) => {
  components.add(node);
};

export const isComponent = (node: unknown): node is HTMLElement =>
  typeof node === 'object' && node !== null && components.has(node);
