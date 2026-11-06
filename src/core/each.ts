import type { Component } from '@em/core/component';
import { em } from '@em/core/em';
import { effect, isSignal, type ReadonlySignal } from '@em/signals/signals';
import type { Child, ComponentProps } from '@em/types';

/**
 * Options of `each`: everything a component takes except its content, which `each` fills, plus how to tell the items
 * apart and what to show when there are none.
 *
 * @template T - The type of an item.
 * @template K - The tag of the list element.
 */
export type EachOptions<T, K extends string = 'div'> = Omit<
  ComponentProps<K>,
  'children' | 'content' | 'html'
> & {
  /**
   * Gives an item its key, which keeps its component, with its state and focus, when the list changes. Without it,
   * strings and numbers are their own key and anything else is keyed by its position.
   */
  by?: (item: T, index: number) => string | number;
  /** What to show while the list has no items. */
  empty?: Child;
};

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
 * Renders a list that follows an array or a signal of an array. The returned element is an ordinary component (a
 * `div` unless `tag` says otherwise) whose children are the components that `render` makes, one for each item. When
 * the signal changes, the children are reconciled by key, so a component whose key is still there is kept and updated
 * in place and only what changed is added, moved or removed. It follows the signal while it is in the document, and
 * stops when it leaves. `render` must return a component, because a key belongs to a component.
 *
 * @example
 * const todos = signal([{ id: 1, text: 'Write docs' }]);
 * const list = each(todos, (todo) => tags.li({ content: todo.text }), { tag: 'ul', by: (todo) => todo.id });
 *
 * @template T - The type of an item.
 * @template K - The tag of the list element.
 * @template R - The tag of the element that `render` makes.
 * @param items - The items, or a signal of them. An array that is changed in place is not noticed: put a new array
 * into the signal.
 * @param render - Makes the component of an item. It gets the item and its position.
 * @param options - The props of the list element, `by` to key the items and `empty` to show when there are none.
 * @returns The list element.
 */
export const each = <T, K extends string = 'div', R extends string = string>(
  items: readonly T[] | ReadonlySignal<readonly T[]>,
  render: (item: T, index: number) => Component<R>,
  options: EachOptions<T, K> = {} as EachOptions<T, K>,
): Component<K> => {
  const { by = defaultKey, empty, mounted, ...props } = options;
  let shown: readonly T[] | undefined;

  /**
   * Reads the current items.
   *
   * @returns The array.
   */
  const read = () => (isSignal(items) ? (items.value as readonly T[]) : (items as readonly T[]));

  /**
   * Makes the children for a list of items and remembers which list they are for.
   *
   * @param list - The items.
   * @returns One component for each item, or the empty content.
   */
  const build = (list: readonly T[]): Child[] => {
    shown = list;
    if (list.length === 0) return [empty];
    return list.map((item, index) => {
      const node = render(item, index);
      if (node.props.key === undefined) node.setState({ key: by(item, index) } as never);
      return node;
    });
  };

  return em.Each({
    tag: 'div',
    ...props,
    children: build(read()),
    /**
     * Follows the items while the list is in the document, and runs the `mounted` of the options.
     *
     * @param element - The inner element of the list.
     * @param component - The list.
     * @returns The cleanup that stops following and runs the cleanup of the options.
     */
    mounted: (element, component) => {
      const stop = effect(() => {
        const list = read();
        if (list !== shown) component.setState({ children: build(list) } as never);
      });
      const cleanup = mounted?.(element, component as never);
      return () => {
        stop();
        cleanup?.();
      };
    },
  } as ComponentProps<K>) as Component<K>;
};
