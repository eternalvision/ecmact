import { Component } from '@em/component';
import type { ComponentProps } from '@em/types';

type ComponentFactory = <K extends string = 'div'>(props?: ComponentProps<K>) => Component<K>;

type ComponentRegistry = Record<string, ComponentFactory>;

const namePattern = /^[A-Za-z][A-Za-z0-9_-]*$/;

/**
 * Tells whether a property name must not create a component, so that `await em` and `String(em)` are safe.
 *
 * @param prop - The property name that was accessed.
 * @returns `true` for symbols and `then`.
 */
export const isIgnoredKey = (prop: string | symbol): prop is symbol | 'then' =>
  typeof prop === 'symbol' || prop === 'then';

/**
 * Registers the custom element for a component name, once, and returns a function that creates it.
 *
 * @param name - The component name. Names are case-insensitive and share one element.
 * @returns The factory that creates components.
 * @throws {TypeError} If the name is not a valid component name.
 */
export const createFactory = (name: string): ComponentFactory => {
  if (!namePattern.test(name)) {
    throw new TypeError(`ecmact: invalid component name "${name}"`);
  }

  const tagName = `em-${name.toLowerCase()}`;

  if (!customElements.get(tagName)) {
    customElements.define(tagName, class extends Component {});
  }

  return <K extends string = 'div'>(props: ComponentProps<K> = {} as ComponentProps<K>) => {
    const element = document.createElement(tagName) as Component<K>;
    element.props = props;
    return element;
  };
};

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
