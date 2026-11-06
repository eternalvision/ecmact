import type { ResolvedProps, RenderState } from '@em/types';
import { applyStyle } from '@em/utils/applyStyle';
import { applyStyleSheets } from '@em/utils/applyStyleSheets';
import { reconcileChildren, toNodes } from '@em/utils/reconcileChildren';
import { setEventListeners } from '@em/utils/setEventListeners';
import { syncProperties } from '@em/utils/syncProperties';
import { syncAttributes } from '@em/utils/syncAttributes';
import { warn } from '@em/utils/warn';

/**
 * Creates the inner element and resets the bookkeeping that belongs to the old one.
 *
 * @param tag - The tag name.
 * @param state - The render state.
 * @returns The new element.
 */
const createElement = (tag: string, state: RenderState) => {
  state.attributes = new Set();
  state.styles = new Set();
  state.listeners = new Map();
  state.properties = new Map();
  state.element = document.createElement(tag);
  return state.element;
};

/**
 * Renders resolved props into a root, creating the inner element on the first call and reusing it afterwards
 * while the tag stays the same. Attributes, styles, listeners and children are diffed, not rebuilt.
 *
 * @param root - The shadow root, or the host for light DOM components.
 * @param props - The props with signals unwrapped.
 * @param state - The render state that persists between calls.
 * @param onError - Receives errors thrown by event listeners. Without it they are rethrown.
 * @returns The inner element.
 */
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
    reconcileChildren(element, content === '' ? children : [content, ...children]);
  } else {
    element.innerHTML = html;
    element.append(...toNodes(children));
  }

  state.properties = syncProperties(element, props, state.properties);

  if (isNew) ref?.(element);

  return element;
};
