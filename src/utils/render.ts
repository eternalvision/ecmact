import type { ResolvedProps, RenderState } from '../types';
import { applyStyle } from './applyStyle';
import { applyStyleSheets } from './applyStyleSheets';
import { setEventListeners } from './setEventListeners';
import { syncAttributes } from './syncAttributes';
import { warn } from './warn';

const createElement = (tag: string, state: RenderState) => {
  state.attributes = new Set();
  state.styles = new Set();
  state.listeners = new Map();
  state.element = document.createElement(tag);
  return state.element;
};

export const render = (
  root: ParentNode,
  props: ResolvedProps,
  state: RenderState,
  onError?: (error: unknown, event: string) => void,
) => {
  const { tag = 'div', content = '', html, style, css, children = [], ref } = props;

  const isNew = state.element?.localName !== tag.toLowerCase();
  const element = isNew ? createElement(tag, state) : (state.element as HTMLElement);

  const isShadow = root instanceof ShadowRoot;
  if (css !== undefined && !isShadow) warn('css is ignored when shadow is false');
  if (html !== undefined && props.content !== undefined)
    warn('content is ignored when html is set');

  const sheetsChanged = isShadow && applyStyleSheets(root, css, state);

  if (isNew || sheetsChanged) root.replaceChildren(...state.sheetNodes, element);

  state.attributes = syncAttributes(element, props, state.attributes);
  state.styles = applyStyle(element, style, state.styles);
  state.listeners = setEventListeners(element, props, state.listeners, onError);

  if (html === undefined) {
    element.replaceChildren(document.createTextNode(content), ...children);
  } else {
    element.innerHTML = html;
    element.append(...children);
  }

  if (isNew) ref?.(element);

  return element;
};
