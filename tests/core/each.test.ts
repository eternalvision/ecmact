import { afterEach, describe, expect, it, vi } from 'vitest';
import { each, signal, tags, type Component } from '@em';
import { resetWarnings } from '@em/utils/warn';
import { inner } from '@tests/helpers';

afterEach(() => {
  resetWarnings();
  document.body.replaceChildren();
});

/**
 * Makes the component of an item for the tests.
 *
 * @param text - The text of the item.
 * @returns A list item.
 */
const item = (text: string) => tags.li({ content: text });

/**
 * Reads the rows of a list.
 *
 * @param list - The list component.
 * @returns The inner elements of its children.
 */
const rows = <K extends string>(list: Component<K>) => [...inner(list).children] as HTMLElement[];

/**
 * Reads the text of the rows of a list.
 *
 * @param list - The list component.
 * @returns The texts.
 */
const texts = <K extends string>(list: Component<K>) =>
  rows(list).map((row) => row.shadowRoot?.textContent);

describe('each', () => {
  it('renders one component for each item of an array, into a div by default', () => {
    const list = each(['a', 'b', 'c'], item);
    document.body.append(list);
    expect(inner(list).localName).toBe('div');
    expect(texts(list)).toEqual(['a', 'b', 'c']);
  });

  it('is an ordinary component: it takes the tag and the other props of the list element', () => {
    const list = each(['a'], item, { tag: 'ul', class: 'todos', 'aria-label': 'Todos' });
    document.body.append(list);
    expect(inner(list).localName).toBe('ul');
    expect(inner(list).className).toBe('todos');
    expect(inner(list).getAttribute('aria-label')).toBe('Todos');
  });

  it('gives render the item and its position', () => {
    const calls: [string, number][] = [];
    each(['x', 'y'], (value, index) => {
      calls.push([value, index]);
      return item(value);
    });
    expect(calls).toEqual([
      ['x', 0],
      ['y', 1],
    ]);
  });

  it('follows a signal while the list is in the document', () => {
    const items = signal(['a', 'b']);
    const list = each(items, item);
    document.body.append(list);
    items.value = ['a', 'b', 'c'];
    expect(texts(list)).toEqual(['a', 'b', 'c']);
    items.value = ['b'];
    expect(texts(list)).toEqual(['b']);
  });

  it('does not render twice when it is put into the document', () => {
    const render = vi.fn(item);
    const list = each(signal(['a', 'b']), render);
    document.body.append(list);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('keeps the component of an item that is still there, and moves it when the order changes', () => {
    const items = signal(['a', 'b', 'c']);
    const list = each(items, item);
    document.body.append(list);
    const [a, b, c] = rows(list).map((row) => row.getRootNode());
    items.value = ['c', 'a', 'b'];
    expect(texts(list)).toEqual(['c', 'a', 'b']);
    expect(rows(list).map((row) => row.getRootNode())).toEqual([c, a, b]);
  });

  it('keeps objects by the key that `by` returns and updates the kept component in place', () => {
    const items = signal([
      { id: 1, text: 'one' },
      { id: 2, text: 'two' },
    ]);
    const list = each(items, (todo) => item(todo.text), { by: (todo) => todo.id });
    document.body.append(list);
    const [first, second] = rows(list).map((row) => row.getRootNode());
    items.value = [
      { id: 2, text: 'two!' },
      { id: 1, text: 'one!' },
    ];
    expect(texts(list)).toEqual(['two!', 'one!']);
    expect(rows(list).map((row) => row.getRootNode())).toEqual([second, first]);
  });

  it('keys an object by its position when `by` is not given', () => {
    const items = signal([{ text: 'one' }, { text: 'two' }]);
    const list = each(items, (todo) => item(todo.text));
    document.body.append(list);
    const [first] = rows(list).map((row) => row.getRootNode());
    items.value = [{ text: 'uno' }, { text: 'dos' }];
    expect(texts(list)).toEqual(['uno', 'dos']);
    expect(rows(list)[0]?.getRootNode()).toBe(first);
  });

  it('keeps the key that render gave a component itself', () => {
    const list = each(['a', 'b'], (value) => tags.li({ content: value, key: `own-${value}` }));
    expect(list.props.children).toHaveLength(2);
    const keys = (list.props.children as Component[]).map((node) => node.props.key);
    expect(keys).toEqual(['own-a', 'own-b']);
  });

  it('shows what `empty` says while there are no items, and the items when they come', () => {
    const items = signal<string[]>([]);
    const list = each(items, item, { empty: 'Nothing here' });
    document.body.append(list);
    expect(inner(list).textContent).toBe('Nothing here');
    items.value = ['a'];
    expect(texts(list)).toEqual(['a']);
    expect(inner(list).textContent).not.toContain('Nothing here');
    items.value = [];
    expect(inner(list).textContent).toBe('Nothing here');
  });

  it('renders nothing for an empty list without `empty`', () => {
    const list = each([] as string[], item);
    document.body.append(list);
    expect(rows(list)).toHaveLength(0);
  });

  it('stops following the signal when it leaves the document, and catches up when it comes back', () => {
    const items = signal(['a']);
    const render = vi.fn(item);
    const list = each(items, render);
    document.body.append(list);
    list.remove();
    items.value = ['a', 'b'];
    expect(render).toHaveBeenCalledTimes(1);
    document.body.append(list);
    expect(texts(list)).toEqual(['a', 'b']);
  });

  it('runs the `mounted` of the options, and its cleanup when the list leaves', () => {
    const order: string[] = [];
    const list = each(['a'], item, {
      mounted: () => {
        order.push('mounted');
        return () => order.push('cleanup');
      },
    });
    document.body.append(list);
    list.remove();
    expect(order).toEqual(['mounted', 'cleanup']);
  });

  it('works with a `mounted` that returns no cleanup', () => {
    const mounted = vi.fn();
    const list = each(['a'], item, { mounted });
    document.body.append(list);
    expect(() => list.remove()).not.toThrow();
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('warns about two items with the same key, as any list of keyed children does', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const items = signal(['a']);
    const list = each(items, item);
    document.body.append(list);
    items.value = ['a', 'a'];
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('duplicate key "a"'));
    spy.mockRestore();
  });
});
