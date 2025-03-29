import { component } from './component';
import type { ComponentProps } from '@types';

interface ComponentRegistry {
  [key: string]: (props: ComponentProps) => component;
}

const em: ComponentRegistry = new Proxy({} as ComponentRegistry, {
  get(_, prop: string) {
    const tagName = `em-${prop.toLowerCase()}`;

    if (!customElements.get(tagName)) {
      customElements.define(
        tagName,
        class extends component {
          constructor(props: ComponentProps) {
            super(props);
          }
        },
      );
    }

    return (props: ComponentProps): component => {
      const element = document.createElement(tagName) as component;
      element.props = props;
      return element;
    };
  },
});

export { em };
