import type { Component } from '@em/component';
import type { Child } from '@em/types';
import { isComponent } from '@em/utils/registry';
import { warn } from '@em/utils/warn';

const isEmpty = (item: Child) => item === undefined || item === null || typeof item === 'boolean';

const keyOf = (node: Node) =>
  isComponent(node) ? (node as unknown as Component).props.key : undefined;

const sameKind = (a: Node, b: Node) => (a as Element).localName === (b as Element).localName;

const reuse = (existing: Node, incoming: Node) => {
  const target = existing as unknown as Component;
  const source = incoming as unknown as Component;
  target.props = source.props;
  source.props.ref?.(target.element as HTMLElement);
};

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

export const toNodes = (items: Child[]) =>
  items
    .filter((item) => !isEmpty(item))
    .map((item) => (typeof item === 'object' ? item : String(item))) as (Node | string)[];

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
