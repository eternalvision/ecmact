import { getConfig, type StyleSource } from '../config';
import type { RenderState } from '../types';

const sharedCache = new WeakMap<StyleSource[], CSSStyleSheet[]>();

const supportsAdoption = (root: ShadowRoot) =>
  typeof CSSStyleSheet === 'function' &&
  'replaceSync' in CSSStyleSheet.prototype &&
  'adoptedStyleSheets' in root;

const toSheet = (source: StyleSource) => {
  if (typeof source !== 'string') return source;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(source);
  return sheet;
};

const toText = (source: StyleSource) =>
  typeof source === 'string'
    ? source
    : Array.from(source.cssRules, (rule) => rule.cssText).join('\n');

const sharedSheets = (sources: StyleSource[]) => {
  let sheets = sharedCache.get(sources);
  if (!sheets) {
    sheets = sources.map(toSheet);
    sharedCache.set(sources, sheets);
  }
  return sheets;
};

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

export const applyStyleSheets = (root: ShadowRoot, css: string | undefined, state: RenderState) => {
  const changed = supportsAdoption(root) ? adopt(root, css, state) : inject(css, state);
  state.sheetText = css;
  return changed;
};
