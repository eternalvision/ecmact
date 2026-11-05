import type { ComponentProps } from '../types';
import { generateAttributes } from './generateAttributes';

interface RenderOptions {
  props: ComponentProps;
  shadowRoot: ShadowRoot;
  generateStyle: () => string;
}

export const render = ({ props, shadowRoot, generateStyle }: RenderOptions) => {
  const { content = '', tag = 'div', children = [] } = props;

  shadowRoot.innerHTML = `
      ${generateStyle()}
      <${tag} ${generateAttributes({ props })}>
        ${content.length > 0 ? content : ''}
        ${children.length > 0 ? `<slot></slot>` : ''}
      </${tag}>
    `;

  const slot = shadowRoot.querySelector('slot');
  children.forEach((child) => slot?.appendChild(child));
};
