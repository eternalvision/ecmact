import type { Component } from '@em/core/component';
import type { Child } from '@em/types';
import { isComponent } from '@em/utils/registry';
import { warn } from '@em/utils/warn';

/**
 * Tells whether a child renders nothing: `undefined`, `null`, `true` and `false`.
 *
 * @param item - The child.
 * @returns `true` for values that are skipped.
 */
const isEmpty = (item: Child) => item === undefined || item === null || typeof item === 'boolean';

/**
 * Reads the `key` prop of a node if it is a component.
 *
 * @param node - A DOM node.
 * @returns The key, or `undefined` for plain nodes and components without a key.
 */
const keyOf = (node: Node) =>
  isComponent(node) ? (node as unknown as Component).props.key : undefined;

/**
 * Tells whether two elements have the same tag, so a component can stand in for the other.
 *
 * @param a - The first element.
 * @param b - The second element.
 * @returns `true` if the tags match.
 */
const sameKind = (a: Node, b: Node) => (a as Element).localName === (b as Element).localName;

/**
 * Keeps an existing component and gives it the props of the new instance, which is discarded.
 * If the new props have a `ref`, it is called with the element that survives.
 *
 * @param existing - The component that is already rendered.
 * @param incoming - The new instance with the same key.
 */
const reuse = (existing: Node, incoming: Node) => {
  const target = existing as unknown as Component;
  const source = incoming as unknown as Component;
  target.props = source.props;
  source.props.ref?.(target.element as HTMLElement);
};

/**
 * Finds the longest run of nodes that is already in the right order, so only the others are moved.
 * Uses the longest increasing subsequence of the current positions; new nodes (position -1) are ignored.
 *
 * @param positions - For every new node, its current index among the children, or -1.
 * @returns The indexes in the new list that stay where they are.
 */
const stableIndexes = (positions: number[]) => {
  const tails: number[] = [];
  const parents: number[] = [];
  positions.forEach((position, index) => {
    if (position < 0) return;
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (positions[tails[middle]] < position) low = middle + 1;
      else high = middle;
    }
    parents[index] = low > 0 ? tails[low - 1] : -1;
    tails[low] = index;
  });
  const stable = new Set<number>();
  let cursor = tails.length > 0 ? tails[tails.length - 1] : -1;
  while (cursor >= 0) {
    stable.add(cursor);
    cursor = parents[cursor];
  }
  return stable;
};

/**
 * Turns children into nodes and strings that `append` accepts, dropping empty values.
 *
 * @param items - The children.
 * @returns Nodes and strings.
 */
export const toNodes = (items: Child[]) =>
  items
    .filter((item) => !isEmpty(item))
    .map((item) => (typeof item === 'object' ? item : String(item))) as (Node | string)[];

/**
 * Updates the children of an element to match a list, touching as little as possible:
 * text nodes are reused by position, components with the same `key` and tag are kept and updated,
 * unchanged runs are not moved, and everything else is replaced or removed.
 *
 * @param parent - The element whose children are updated.
 * @param items - The new children: nodes, text, numbers and empty values.
 */
export const reconcileChildren = (parent: HTMLElement, items: Child[]) => {
  const previous = Array.from(parent.childNodes);
  const keyed = new Map<unknown, Node>();
  previous.forEach((node) => {
    const key = keyOf(node);
    if (key !== undefined) keyed.set(key, node);
  });
  const texts = previous.filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
  const seen = new Set<unknown>();
  const next: Node[] = [];
  let textIndex = 0;

  items.forEach((item) => {
    if (isEmpty(item)) return;
    if (typeof item !== 'object') {
      const text = String(item);
      const node = texts[textIndex++] ?? document.createTextNode('');
      if (node.data !== text) node.data = text;
      next.push(node);
      return;
    }
    const node = item as Node;
    const key = keyOf(node);
    if (key !== undefined && seen.has(key)) warn(`duplicate key "${String(key)}" in children`);
    seen.add(key);
    const existing = key === undefined ? undefined : keyed.get(key);
    if (existing && existing !== node && sameKind(existing, node)) {
      keyed.delete(key);
      reuse(existing, node);
      next.push(existing);
    } else {
      next.push(node);
    }
  });

  const kept = new Set(next);
  previous.forEach((node) => {
    if (!kept.has(node)) node.remove();
  });

  const current = new Map<Node, number>(
    Array.from(parent.childNodes, (node, index) => [node, index] as const),
  );
  const stable = stableIndexes(next.map((node) => current.get(node) ?? -1));
  let reference: Node | null = null;
  for (let index = next.length - 1; index >= 0; index--) {
    const node = next[index] as Node;
    if (!stable.has(index)) parent.insertBefore(node, reference);
    reference = node;
  }
};
