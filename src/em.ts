import { Component } from './component';
import type { ComponentProps } from './types';

type ComponentFactory = (props?: ComponentProps) => Component;

type ComponentRegistry = Record<string, ComponentFactory>;

const namePattern = /^[A-Za-z][A-Za-z0-9_-]*$/;

const em: ComponentRegistry = new Proxy({} as ComponentRegistry, {
  get(_, prop) {
    if (typeof prop === 'symbol' || prop === 'then') return undefined;

    if (!namePattern.test(prop)) {
      throw new TypeError(`ecmact: invalid component name "${prop}"`);
    }

    const tagName = `em-${prop.toLowerCase()}`;

    if (!customElements.get(tagName)) {
      customElements.define(tagName, class extends Component {});
    }

    return (props: ComponentProps = {}) => {
      const element = document.createElement(tagName) as Component;
      element.props = props;
      return element;
    };
  },
});

export { em };
