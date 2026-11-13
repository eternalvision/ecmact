import { bind, isReactive, read } from '@em/render/bindings';
import { fill, toNodes } from '@em/render/children';
import { untracked } from '@em/signals/signals';
import type { Child, Getter } from '@em/types';
import { warn } from '@em/utils/warn';

/**
 * Options of `each`: how to tell the items apart and what to show when there are none.
 *
 * @template T - The type of an item.
 */
export interface EachOptions<T> {
  /**
   * Gives an item its key, which keeps its node, with its state and focus, when the list changes. Without it,
   * strings and numbers are their own key and anything else is keyed by its position.
   *
   * @param item - The item.
   * @param index - Its position.
   * @returns The key.
   */
  by?: (item: T, index: number) => string | number;
  /** What to show while the list has no items. */
  empty?: Child;
}

/** A rendered item: the item it was rendered for, and its node. */
interface Row {
  /** The item. */
  item: unknown;
  /** The node that `render` made for it. */
  node: Node;
}

/**
 * Reads the key of an item when `by` is not given.
 *
 * @param item - The item.
 * @param index - Its position.
 * @returns The item itself if it is a string or a number, the position otherwise.
 */
const defaultKey = (item: unknown, index: number) =>
  typeof item === 'string' || typeof item === 'number' ? item : index;

/**
 * Finds where the focus is inside a node, as the positions of the children that lead to the focused element.
 *
 * @param node - The node that is about to be replaced.
 * @returns The path, or `undefined` if the focus is not inside the node.
 */
const focusPath = (node: Node) => {
  const { activeElement } = node.getRootNode() as Document | ShadowRoot;
  if (!activeElement || !node.contains(activeElement)) return undefined;
  const path: number[] = [];
  let current: Element = activeElement;
  while (current !== node) {
    const parent = current.parentElement as Element;
    path.unshift(Array.prototype.indexOf.call(parent.children, current));
    current = parent;
  }
  return path;
};

/**
 * Moves the focus to the element at a path inside a node, if there is one.
 *
 * @param node - The node that replaced the focused one.
 * @param path - The positions of the children that lead to the element.
 */
const focusAt = (node: Node, path: number[]) => {
  const target = path.reduce<Element | undefined>(
    (element, index) => element?.children?.[index],
    node as Element,
  );
  (target as HTMLElement | undefined)?.focus?.();
};

/**
 * Renders a list that follows an array, a signal of an array or a function that returns one. Put the result
 * among the children of any element: the nodes that `render` makes are placed right there, one for each item,
 * with no wrapper. When the list changes, an item that is still there keeps its node, an item that changed is
 * rendered again in place, and only what changed is added, moved or removed.
 *
 * @example
 * const todos = signal([{ id: 1, text: 'Write docs' }]);
 * const list = tags.ul(each(todos, (todo) => tags.li(todo.text), { by: (todo) => todo.id }));
 *
 * @template T - The type of an item.
 * @param items - The items, or a signal or a function that returns them. An array that is changed in place is
 * not noticed: make a new array.
 * @param render - Makes the node of an item. It gets the item and the position it had when it was rendered.
 * @param options - `by` to key the items and `empty` to show when there are none.
 * @returns A fragment to use as a child.
 */
export const each = <T>(
  items: readonly T[] | Getter<readonly T[]>,
  render: (item: T, index: number) => Node,
  { by = defaultKey, empty }: EachOptions<T> = {},
): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  const start = document.createComment('');
  const end = document.createComment('');
  const fallback = toNodes(empty);
  let rows = new Map<unknown, Row>();
  fragment.append(start, end);

  bind(start, () => {
    const list = isReactive(items) ? read(items) : items;
    untracked(() => {
      const next = new Map<unknown, Row>();
      let focus: { node: Node; path: number[] } | undefined;
      list.forEach((item, index) => {
        let key: unknown = by(item, index);
        if (next.has(key)) {
          warn(`duplicate key "${String(key)}" in each`);
          key = Symbol();
        }
        const previous = rows.get(key);
        if (previous && Object.is(previous.item, item)) {
          next.set(key, previous);
          return;
        }
        const path = previous && focusPath(previous.node);
        const node = render(item, index);
        if (path) focus = { node, path };
        next.set(key, { item, node });
      });
      rows = next;
      fill(start, end, list.length === 0 ? fallback : Array.from(next.values(), (row) => row.node));
      if (focus) focusAt(focus.node, focus.path);
    });
  });

  return fragment;
};
