import { extraSheets, supportsAdoption } from '@em/render/applyStyleSheets';
import { warn } from '@em/utils/warn';

/** A place that holds stylesheets: the document, or the shadow root of a component. */
export type StyleRoot = Document | ShadowRoot;

/** The styles that were put into one root. */
interface Entry {
  /** The rules that are already there. */
  seen: Set<string>;
  /**
   * Adds a rule to the root.
   *
   * @param rule - The CSS rule.
   */
  add: (rule: string) => void;
  /**
   * Tells whether the styles are still in the root.
   *
   * @returns `false` if something removed them, so that they have to be put there again.
   */
  alive: () => boolean;
}

const entries = new WeakMap<StyleRoot, Entry>();

/**
 * Tells whether a node is a place for stylesheets, as opposed to the top of a tree that is not in a document.
 *
 * @param node - The root node of an element.
 * @returns `true` for a document and for a shadow root.
 */
export const isStyleRoot = (node: Node): node is StyleRoot =>
  node.nodeType === 9 || (node.nodeType === 11 && 'host' in node);

/**
 * Starts keeping styles in a root: in a constructable stylesheet that the root adopts, or in `<style>` elements
 * where those are not available.
 *
 * @param root - The document or the shadow root.
 * @returns The entry for the root.
 */
const create = (root: StyleRoot): Entry => {
  const seen = new Set<string>();
  if (supportsAdoption(root)) {
    const sheet = new CSSStyleSheet();
    extraSheets.add(sheet);
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return {
      seen,
      /**
       * Inserts the rule at the end of the stylesheet. A rule the browser cannot parse is skipped with a warning.
       *
       * @param rule - The CSS rule.
       */
      add: (rule) => {
        try {
          sheet.insertRule(rule, sheet.cssRules.length);
        } catch {
          warn(`a styled rule was ignored, the browser cannot parse it: ${rule.slice(0, 60)}`);
        }
      },
      /**
       * Tells whether the root still adopts the stylesheet.
       *
       * @returns `true` while it does.
       */
      alive: () => root.adoptedStyleSheets.includes(sheet),
    };
  }
  const target = root.nodeType === 9 ? (root as Document).head : root;
  const nodes: HTMLStyleElement[] = [];
  return {
    seen,
    /**
     * Appends a `<style>` element with the rule.
     *
     * @param rule - The CSS rule.
     */
    add: (rule) => {
      const node = document.createElement('style');
      node.setAttribute('data-ecmact', 'styled');
      node.textContent = rule;
      nodes.push(node);
      target.append(node);
    },
    /**
     * Tells whether the `<style>` elements are still where they were put.
     *
     * @returns `true` while they are.
     */
    alive: () => nodes.every((node) => node.parentNode === target),
  };
};

/**
 * Puts CSS rules into a root, each rule once.
 *
 * @param root - The document or the shadow root that the styled element is in.
 * @param rules - The rules the element needs.
 */
export const inject = (root: StyleRoot, rules: readonly string[]) => {
  let entry = entries.get(root);
  if (!entry?.alive()) {
    entry = create(root);
    entries.set(root, entry);
  }
  const { seen, add } = entry;
  rules.forEach((rule) => {
    if (seen.has(rule)) return;
    seen.add(rule);
    add(rule);
  });
};
