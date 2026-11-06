import type { ComponentProps, RenderState } from '../types';
import { applyStyle } from './applyStyle';
import { setEventListeners } from './setEventListeners';
import { syncAttributes } from './syncAttributes';

const createElement = (tag: string, root: ParentNode, state: RenderState) => {
  const element = document.createElement(tag);
  root.replaceChildren(element);
  state.attributes = new Set();
  state.styles = new Set();
  state.listeners = new Map();
  state.element = element;
  return element;
};

export const render = (root: ParentNode, props: ComponentProps, state: RenderState) => {
  const { tag = 'div', content = '', html, style, children = [], ref } = props;

  const isNew = state.element?.localName !== tag.toLowerCase();
  const element = isNew ? createElement(tag, root, state) : (state.element as HTMLElement);

  state.attributes = syncAttributes(element, props, state.attributes);
  state.styles = applyStyle(element, style, state.styles);
  state.listeners = setEventListeners(element, props, state.listeners);

  if (html === undefined) {
    element.replaceChildren(document.createTextNode(content), ...children);
  } else {
    element.innerHTML = html;
    element.append(...children);
  }

  if (isNew) ref?.(element);

  return element;
};
