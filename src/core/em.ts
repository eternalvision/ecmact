import { Component, init } from '@em/core/component';
import { getConfig } from '@em/core/config';
import { isIgnoredKey, splitArgs } from '@em/core/element';
import type { ComponentProps, Factory } from '@em/types';

/** An object whose properties are component factories, created on first access. */
type ComponentRegistry = Record<string, Factory<ComponentProps, Component>>;

const namePattern = /^[A-Za-z][A-Za-z0-9_-]*$/;

/**
 * Turns a component name into the name of its custom element. The words of a camelCase name are joined with
 * hyphens, so `UserCard` is `user-card`. A name of one word gets the configured prefix, because a custom
 * element name must contain a hyphen: `Card` is `em-card` by default.
 *
 * @param name - The component name.
 * @returns The custom element name.
 * @throws {TypeError} If the name is not a valid component name, or has one word while the prefix is empty.
 */
export const elementName = (name: string) => {
  if (!namePattern.test(name)) {
    throw new TypeError(`ecmact: invalid component name "${name}"`);
  }
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  if (kebab.includes('-')) return kebab;
  const { prefix } = getConfig();
  if (prefix === '') {
    throw new TypeError(
      `ecmact: component "${name}" needs a name of two words, such as "${name}View", or a prefix: a custom element name must contain a hyphen`,
    );
  }
  return `${prefix}-${kebab}`;
};

/**
 * Registers the custom element for a component name, once, and returns a function that creates it.
 *
 * @param name - The component name.
 * @returns The factory that creates components.
 * @throws {TypeError} If the name cannot be turned into a custom element name.
 */
export const createFactory = (name: string): Factory<ComponentProps, Component> => {
  const tagName = elementName(name);

  if (!customElements.get(tagName)) {
    customElements.define(tagName, class extends Component {});
  }

  return (...args: unknown[]) => {
    const element = document.createElement(tagName) as Component;
    element[init](...splitArgs(args));
    return element;
  };
};

/**
 * Creates components by name: `em.UserCard({ css }, ...children)` registers `<user-card>` on first use and
 * returns an instance. A component is a custom element that keeps its children in a shadow root, with its own
 * stylesheet and lifecycle hooks. The first argument may be the props, everything else is children.
 *
 * @example
 * const card = em.UserCard({ css: 'h2 { margin: 0 }' }, tags.h2('Ada'), tags.p('Engineer'));
 */
const em: ComponentRegistry = new Proxy({} as ComponentRegistry, {
  /**
   * Creates the component factory for the property that was accessed.
   *
   * @param _ - The proxy target, not used.
   * @param prop - The component name.
   * @returns The factory, or `undefined` for ignored keys.
   */
  get: (_, prop) => (isIgnoredKey(prop) ? undefined : createFactory(prop)),
});

export { em };
