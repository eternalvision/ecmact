import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { each, em, signal, tags } from '@em';
import { resetWarnings } from '@em/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
  document.body.replaceChildren();
});

/** An item with an id, for the tests of keys. */
interface Todo {
  /** The key. */
  id: number;
  /** The text. */
  text: string;
}

const texts = (list: Element) => Array.from(list.children, (child) => child.textContent);

describe('each', () => {
  it('renders one node for each item of an array, with no wrapper', () => {
    const list = tags.ul(each(['a', 'b', 'c'], (text) => tags.li(text)));
    expect(list.outerHTML.replaceAll('<!---->', '')).toBe(
      '<ul><li>a</li><li>b</li><li>c</li></ul>',
    );
  });

  it('passes the position to render', () => {
    const list = tags.ul(each(['a', 'b'], (text, index) => tags.li(`${index}:${text}`)));
    expect(texts(list)).toEqual(['0:a', '1:b']);
  });

  it('follows a signal and keeps the nodes of the items that stay', () => {
    const items = signal(['a', 'b']);
    const list = tags.ul(each(items, (text) => tags.li(text)));
    const [first, second] = Array.from(list.children);
    items.value = ['b', 'c', 'a'];
    expect(texts(list)).toEqual(['b', 'c', 'a']);
    expect(list.children[0]).toBe(second);
    expect(list.children[2]).toBe(first);
  });

  it('follows a function', () => {
    const count = signal(1);
    const list = tags.ul(
      each(
        () => Array.from({ length: count.value }, (_, index) => index),
        (index) => tags.li(String(index)),
      ),
    );
    count.value = 3;
    expect(texts(list)).toEqual(['0', '1', '2']);
  });

  it('keys objects with by and keeps the node of an item that did not change', () => {
    const a: Todo = { id: 1, text: 'a' };
    const b: Todo = { id: 2, text: 'b' };
    const items = signal([a, b]);
    const render = vi.fn((todo: Todo) => tags.li(todo.text));
    const list = tags.ul(each(items, render, { by: (todo) => todo.id }));
    const row = list.children[1];
    items.value = [b, a];
    expect(list.children[0]).toBe(row);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('renders an item again in place when it changed under the same key', () => {
    const items = signal<Todo[]>([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    const list = tags.ul(each(items, (todo) => tags.li(todo.text), { by: (todo) => todo.id }));
    const [first, second] = Array.from(list.children);
    items.value = [items.value[0], { id: 2, text: 'B' }];
    expect(texts(list)).toEqual(['a', 'B']);
    expect(list.children[0]).toBe(first);
    expect(list.children[1]).not.toBe(second);
  });

  it('keys objects by their position without by', () => {
    const items = signal([{ text: 'a' }]);
    const list = tags.ul(each(items, (item) => tags.li(item.text)));
    items.value = [{ text: 'b' }, { text: 'c' }];
    expect(texts(list)).toEqual(['b', 'c']);
  });

  it('warns about a duplicate key and still renders both items', () => {
    const list = tags.ul(each(['a', 'a'], (text) => tags.li(text)));
    expect(texts(list)).toEqual(['a', 'a']);
    expect(spy).toHaveBeenCalledWith('ecmact: duplicate key "a" in each');
  });

  it('shows the empty content while there are no items', () => {
    const items = signal<string[]>([]);
    const list = tags.ul(each(items, (text) => tags.li(text), { empty: tags.li('Nothing') }));
    expect(texts(list)).toEqual(['Nothing']);
    items.value = ['a'];
    expect(texts(list)).toEqual(['a']);
    items.value = [];
    expect(texts(list)).toEqual(['Nothing']);
  });

  it('renders nothing for an empty list without empty content', () => {
    const list = tags.ul(each([], () => tags.li()));
    expect(list.children).toHaveLength(0);
  });

  it('does not follow the signals that render reads', () => {
    const items = signal(['a']);
    const other = signal(0);
    const render = vi.fn((text: string) => tags.li(`${text}${other.value}`));
    tags.ul(each(items, render));
    other.value = 1;
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('leaves the siblings around the list alone', () => {
    const items = signal(['a']);
    const list = tags.ul(
      tags.li('first'),
      each(items, (text) => tags.li(text)),
      tags.li('last'),
    );
    items.value = ['a', 'b'];
    expect(texts(list)).toEqual(['first', 'a', 'b', 'last']);
  });
});

describe('each: focus', () => {
  it.each(['document', 'shadow'] as const)(
    'keeps the focus and text selection on a retained row moved in the %s',
    (scope) => {
      const rows = [
        { id: 1, text: 'first' },
        { id: 2, text: 'second' },
        { id: 3, text: 'third' },
      ];
      const items = signal(scope === 'document' ? rows.slice(0, 2) : rows);
      const list = tags.ul(
        each(items, (todo) => tags.li(tags.input({ value: todo.text })), {
          by: (todo) => todo.id,
        }),
      );
      document.body.append(scope === 'document' ? list : em.FocusList(list));
      const root = list.getRootNode() as Document | ShadowRoot;
      const row = list.children[scope === 'document' ? 1 : 0];
      const input = row.querySelector('input')!;
      input.focus();
      input.setSelectionRange(1, 3, 'backward');
      expect(root.activeElement).toBe(input);

      items.value = scope === 'document' ? [rows[1], rows[0]] : [rows[1], rows[2], rows[0]];

      expect(list.children[scope === 'document' ? 0 : 2]).toBe(row);
      expect(row.querySelector('input')).toBe(input);
      expect(root.activeElement).toBe(input);
      expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([
        1,
        3,
        'backward',
      ]);
    },
  );

  it('does not move focus to a retained row when the focused row is removed', () => {
    const items = signal([1, 2, 3]);
    const list = tags.div(each(items, () => tags.input(), { by: (id) => id }));
    document.body.append(list);
    list.querySelector('input')!.focus();

    items.value = [3, 2];

    expect(document.activeElement).toBe(document.body);
  });

  it('restores focus inside the shadow root of a retained row', () => {
    const items = signal([1, 2]);
    const list = tags.div(each(items, () => em.FocusRow(tags.input()), { by: (id) => id }));
    document.body.append(list);
    const row = list.children[1];
    const input = row.shadowRoot!.querySelector('input')!;
    input.focus();

    items.value = [2, 1];

    expect(list.firstElementChild).toBe(row);
    expect(row.shadowRoot!.activeElement).toBe(input);
  });

  it('does not focus a retained row that did not move', () => {
    const items = signal([1, 2]);
    const list = tags.div(each(items, () => tags.input(), { by: (id) => id }));
    document.body.append(list);
    const input = list.querySelector('input')!;
    input.focus();
    const focus = vi.spyOn(input, 'focus');

    items.value = [2, 1];

    expect(document.activeElement).toBe(input);
    expect(focus).not.toHaveBeenCalled();
  });

  it('keeps the new focus when rendering a row focuses something outside the list', () => {
    const outside = tags.input();
    const items = signal([1, 2]);
    const list = tags.div(
      each(items, (id) => {
        if (id === 3) outside.focus();
        return tags.input();
      }),
    );
    document.body.append(outside, list);
    list.querySelectorAll('input')[1].focus();

    items.value = [2, 3, 1];

    expect(document.activeElement).toBe(outside);
  });

  it('keeps focus on the retained row that a new row renderer focused', () => {
    const second = tags.input();
    const items = signal([1, 2]);
    const list = tags.div(
      each(items, (id) => {
        if (id === 2) return second;
        if (id === 3) second.focus();
        return tags.input();
      }),
    );
    document.body.append(list);
    (list.firstElementChild as HTMLInputElement).focus();

    items.value = [2, 3, 1];

    expect(list.firstElementChild).toBe(second);
    expect(document.activeElement).toBe(second);
  });

  const setup = (render: (todo: Todo) => Node) => {
    const items = signal<Todo[]>([{ id: 1, text: 'a' }]);
    const list = tags.ul(each(items, render, { by: (todo) => todo.id }));
    document.body.append(list);
    const update = () => {
      items.value = [{ id: 1, text: 'b' }];
    };
    return { list, update };
  };

  it('keeps the focus on the same place of an item that is rendered again', () => {
    const { list, update } = setup((todo) => tags.li(tags.span(todo.text), tags.input()));
    list.querySelector('input')!.focus();
    update();
    expect(document.activeElement).toBe(list.querySelector('input'));
    expect(list.textContent).toBe('b');
  });

  it('keeps the focus on the node itself', () => {
    const { list, update } = setup((todo) => tags.button(todo.text));
    list.querySelector('button')!.focus();
    update();
    expect(document.activeElement).toBe(list.querySelector('button'));
  });

  it('leaves the focus alone when it is somewhere else', () => {
    const outside = tags.input();
    const { update } = setup((todo) => tags.li(todo.text));
    document.body.append(outside);
    outside.focus();
    update();
    expect(document.activeElement).toBe(outside);
  });

  it('gives up when the new node has no such place', () => {
    let version = 0;
    const { list, update } = setup(() =>
      version++ === 0 ? tags.li(tags.input()) : document.createTextNode('text'),
    );
    list.querySelector('input')!.focus();
    expect(update).not.toThrow();
  });

  it('gives up when the new node cannot take the focus', () => {
    let version = 0;
    const { list, update } = setup(() =>
      version++ === 0 ? tags.button('x') : document.createTextNode('text'),
    );
    list.querySelector('button')!.focus();
    expect(update).not.toThrow();
  });
});
