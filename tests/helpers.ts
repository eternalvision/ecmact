import { vi } from 'vitest';
import { extraSheets } from '@em/render/applyStyleSheets';
import { mount } from '@em/utils/mount';
import type { SheetState } from '@em/types';

export const createState = (): SheetState => ({
  ownSheet: null,
  sheetText: undefined,
  sheetKey: '',
  sheetNodes: [],
});

export const createRoot = () => document.createElement('div').attachShadow({ mode: 'open' });

export const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/**
 * Records the rules that the library inserts into constructable stylesheets, for `styledRules`.
 * Call it in `beforeEach`; the spy calls the real method and `vi.restoreAllMocks` removes it.
 */
export const watchRules = () => vi.spyOn(CSSStyleSheet.prototype, 'insertRule');

/**
 * The rules that styled elements put into a root, in order, as the library wrote them: the text of the
 * `<style>` elements where stylesheets cannot be constructed, and the rules that the browser accepted into
 * the stylesheets the root adopts (recorded by `watchRules`). The text does not depend on how an engine
 * serialises CSS.
 */
export const styledRules = (root: Document | ShadowRoot) => {
  const target = root.nodeType === 9 ? (root as Document).head : root;
  const nodes = Array.from(
    target.querySelectorAll('style[data-ecmact="styled"]'),
    (node) => node.textContent ?? '',
  );
  const insert = typeof CSSStyleSheet === 'function' ? CSSStyleSheet.prototype.insertRule : null;
  if (insert === null || !vi.isMockFunction(insert)) return nodes;
  const { calls, contexts, results } = insert.mock;
  const adopted = root.adoptedStyleSheets;
  const inserted = calls
    .filter(
      (_, index) =>
        results[index].type === 'return' && adopted.includes(contexts[index] as CSSStyleSheet),
    )
    .map(([rule]) => rule);
  return [...nodes, ...inserted];
};

export const sheet = (element: Element) => {
  if (!element.isConnected) mount(document.body, element);
  const name = Array.from(element.classList).find((item) => item.startsWith('em-'));
  return styledRules(document)
    .filter((text) => text.startsWith('@keyframes') || text.startsWith(`.${name} `))
    .join('\n');
};

/**
 * Removes what the library put into the document, and nothing else: its `<style>` elements and the
 * stylesheets of styled elements that the document adopts.
 */
export const cleanStyles = () => {
  document.head.querySelectorAll('style[data-ecmact]').forEach((node) => node.remove());
  document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
    (item) => !extraSheets.has(item),
  );
};
