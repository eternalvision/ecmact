import type { ComponentProps, RenderState } from '../types';
import { applyStyle } from './applyStyle';
import { applyStyleSheets } from './applyStyleSheets';
import { setEventListeners } from './setEventListeners';
import { syncAttributes } from './syncAttributes';

const createElement = (tag: string, state: RenderState) => {
  state.attributes = new Set();
  state.styles = new Set();
  state.listeners = new Map();
  state.element = document.createElement(tag);
  return state.element;
};

export const render = (root: ParentNode, props: ComponentProps, state: RenderState) => {
  const { tag = 'div', content = '', html, style, css, children = [], ref } = props;

  const isNew = state.element?.localName !== tag.toLowerCase();
  const element = isNew ? createElement(tag, state) : (state.element as HTMLElement);

  const sheetsChanged = root instanceof ShadowRoot && applyStyleSheets(root, css, state);

  if (isNew || sheetsChanged) root.replaceChildren(...state.sheetNodes, element);

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
