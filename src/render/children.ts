import { notifyAttached } from '@em/core/context';
import { bind, isReactive, pause, read, resume } from '@em/render/bindings';
import type { Child, Getter } from '@em/types';

/**
 * Tells whether a child is plain text or nothing, as opposed to nodes, lists and reactive values.
 *
 * @param value - The child.
 * @returns `true` for strings, numbers, booleans, `null` and `undefined`.
 */
const isPlain = (value: Child): value is string | number | boolean | null | undefined =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');

/**
 * Turns a plain child into text. `false`, `true`, `null` and `undefined` render nothing.
 *
 * @param value - The child.
 * @returns The text.
 */
const toText = (value: string | number | boolean | null | undefined) =>
  value === null || value === undefined || typeof value === 'boolean' ? '' : String(value);

/**
 * Finds the longest run of nodes that is already in the right order, so only the others are moved.
 * Uses the longest increasing subsequence of the current positions; new nodes (position -1) are ignored.
 *
 * @param positions - For every new node, its current index among the nodes, or -1.
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
 * Makes the nodes between two markers match a list, touching as little as possible: nodes that are already
 * there stay, unchanged runs are not moved, nodes that are gone are removed and paused, and nodes that come
 * back are resumed.
 *
 * @param start - The node before the range.
 * @param end - The node after the range, a sibling of `start`.
 * @param nodes - The nodes the range must hold, in order.
 */
export const fill = (start: Node, end: Node, nodes: Node[]) => {
  const parent = end.parentNode as Node;
  const kept = new Set(nodes);
  const current = new Map<Node, number>();
  let node = start.nextSibling as Node;
  while (node !== end) {
    const next = node.nextSibling as Node;
    if (kept.has(node)) {
      current.set(node, current.size);
    } else {
      parent.removeChild(node);
      pause(node);
    }
    node = next;
  }
  const stable = stableIndexes(nodes.map((item) => current.get(item) ?? -1));
  let reference = end;
  let inserted = false;
  for (let index = nodes.length - 1; index >= 0; index--) {
    const item = nodes[index];
    if (!stable.has(index)) {
      parent.insertBefore(item, reference);
      resume(item);
      inserted = true;
    }
    reference = item;
  }
  if (inserted && parent.isConnected) notifyAttached();
};

/**
 * Renders a reactive child. It starts as one text node, which is enough for text; when the value is nodes or a
 * list, they are placed after that text node, up to a comment that marks the end.
 *
 * @param source - The signal or the function.
 * @returns The nodes of the region.
 */
const region = (source: Getter<Child>) => {
  const holder = document.createDocumentFragment();
  const text = document.createTextNode('');
  let end: Comment | undefined;
  holder.append(text);
  bind(text, () => {
    const value = read(source);
    const plain = isPlain(value);
    text.data = plain ? toText(value) : '';
    if (plain && !end) return;
    if (!end) {
      end = document.createComment('');
      text.after(end);
    }
    fill(text, end, plain ? [] : toNodes(value));
  });
  return Array.from(holder.childNodes);
};

/**
 * Turns children into nodes. Lists and fragments are flattened, text becomes text nodes, empty values are
 * dropped, and reactive children become regions that follow their signals.
 *
 * @param child - A child or a list of children.
 * @param nodes - The list to add the nodes to.
 * @returns The nodes.
 */
export const toNodes = (child: Child, nodes: Node[] = []): Node[] => {
  if (Array.isArray(child)) {
    child.forEach((item: Child) => toNodes(item, nodes));
  } else if (isReactive(child)) {
    nodes.push(...region(child as Getter<Child>));
  } else if (isPlain(child)) {
    const text = toText(child);
    if (text !== '') nodes.push(document.createTextNode(text));
  } else if ((child as Node).nodeType === 11) {
    nodes.push(...Array.from((child as Node).childNodes));
  } else {
    nodes.push(child as Node);
  }
  return nodes;
};

/**
 * Appends children to a parent.
 *
 * @param parent - The element, shadow root or fragment to append to.
 * @param children - The children.
 */
export const appendChildren = (parent: ParentNode, children: Child) => {
  parent.append(...toNodes(children));
};
