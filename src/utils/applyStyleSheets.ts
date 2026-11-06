import { getConfig, type StyleSource } from '@em/config';
import type { RenderState } from '@em/types';

const sharedCache = new WeakMap<StyleSource[], CSSStyleSheet[]>();
const hoisted = new WeakSet<StyleSource[]>();
const propertyRule = /@property[^{]+\{[^}]*\}/g;

/**
 * Tells whether the browser supports constructable stylesheets on a shadow root.
 *
 * @param root - The shadow root.
 * @returns `true` if `adoptedStyleSheets` and `replaceSync` are available.
 */
const supportsAdoption = (root: ShadowRoot) =>
  typeof CSSStyleSheet === 'function' &&
  'replaceSync' in CSSStyleSheet.prototype &&
  'adoptedStyleSheets' in root;

/**
 * Converts a style source to a stylesheet object.
 *
 * @param source - CSS text or a stylesheet.
 * @returns A stylesheet; stylesheets are returned as they are.
 */
const toSheet = (source: StyleSource) => {
  if (typeof source !== 'string') return source;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(source);
  return sheet;
};

/**
 * Converts a style source to CSS text.
 *
 * @param source - CSS text or a stylesheet.
 * @returns The CSS text.
 */
const toText = (source: StyleSource) =>
  typeof source === 'string'
    ? source
    : Array.from(source.cssRules, (rule) => rule.cssText).join('\n');

/**
 * Converts the shared style sources to stylesheets, once per list, so every component reuses them.
 *
 * @param sources - The configured shared style sources.
 * @returns The stylesheets.
 */
const sharedSheets = (sources: StyleSource[]) => {
  let sheets = sharedCache.get(sources);
  if (!sheets) {
    sheets = sources.map(toSheet);
    sharedCache.set(sources, sheets);
  }
  return sheets;
};

/**
 * Gives a shadow root the shared stylesheets and the component's own one.
 *
 * @param root - The shadow root.
 * @param css - The component's css text, if any.
 * @param state - The render state that keeps the own stylesheet.
 * @returns Always `false`, because no nodes need to be placed.
 */
const adopt = (root: ShadowRoot, css: string | undefined, state: RenderState) => {
  if (css === undefined) {
    state.ownSheet = null;
  } else {
    state.ownSheet ??= new CSSStyleSheet();
    if (state.sheetText !== css) state.ownSheet.replaceSync(css);
  }
  const shared = sharedSheets(getConfig().styles);
  root.adoptedStyleSheets = state.ownSheet ? [...shared, state.ownSheet] : shared;
  return false;
};

/**
 * Builds `<style>` nodes for the shared and own CSS when constructable stylesheets are not available.
 *
 * @param css - The component's css text, if any.
 * @param state - The render state that keeps the nodes.
 * @returns `true` if the nodes changed and have to be placed again.
 */
const inject = (css: string | undefined, state: RenderState) => {
  const texts = getConfig().styles.map(toText);
  if (css !== undefined) texts.push(css);
  const key = JSON.stringify(texts);
  if (key === state.sheetKey) return false;
  state.sheetKey = key;
  state.sheetNodes = texts.map((text) => {
    const node = document.createElement('style');
    node.textContent = text;
    return node;
  });
  return true;
};

/**
 * Copies `@property` rules from the shared styles into the document, once per list.
 * Browsers only honor `@property` in the document, not in a shadow root, and Tailwind 4 relies on it.
 *
 * @param sources - The configured shared style sources.
 */
const hoistProperties = (sources: StyleSource[]) => {
  if (hoisted.has(sources)) return;
  hoisted.add(sources);
  const rules = sources.flatMap((source) => toText(source).match(propertyRule) ?? []);
  if (rules.length === 0) return;
  const node = document.createElement('style');
  node.setAttribute('data-ecmact', 'properties');
  node.textContent = rules.join('\n');
  document.head.append(node);
};

/**
 * Attaches the shared stylesheets and the component's `css` to a shadow root.
 *
 * @param root - The shadow root.
 * @param css - The component's css text, if any.
 * @param state - The render state.
 * @returns `true` if style nodes changed and the children of the root have to be placed again.
 */
export const applyStyleSheets = (root: ShadowRoot, css: string | undefined, state: RenderState) => {
  hoistProperties(getConfig().styles);
  const changed = supportsAdoption(root) ? adopt(root, css, state) : inject(css, state);
  state.sheetText = css;
  return changed;
};
