import { Component } from '@em/component';
import type { ComponentProps } from '@em/types';

type ComponentFactory = <K extends string = 'div'>(props?: ComponentProps<K>) => Component<K>;

type ComponentRegistry = Record<string, ComponentFactory>;

const namePattern = /^[A-Za-z][A-Za-z0-9_-]*$/;

export const isIgnoredKey = (prop: string | symbol): prop is symbol | 'then' =>
  typeof prop === 'symbol' || prop === 'then';

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
  get: (_, prop) => (isIgnoredKey(prop) ? undefined : createFactory(prop)),
});

export { em };
