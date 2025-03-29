import { generateAttributes } from './generateAttributes';

export const render = ({ props, shadowRoot, generateStyle }) => {
  const { content = '', tag = 'div', children = [] } = props;

  shadowRoot!.innerHTML = `
      ${generateStyle()}
      <${tag} ${generateAttributes({ props })}>
        ${content.length > 0 ? content : ''}
        ${children.length > 0 ? `<slot></slot>` : ''}
      </${tag}>
    `;

  const slot = shadowRoot!.querySelector('slot') as HTMLSlotElement;
  children.forEach((child: any) => slot.appendChild(child));
};
