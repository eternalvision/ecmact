import { afterEach, describe, expect, it } from 'vitest';
import { each, em, signal, tags } from '@em';
import { mount } from '@em/utils/mount';

/** A row of the list. */
interface Row {
  /** The key. */
  id: number;
  /** The text of the input. */
  text: string;
}

afterEach(() => {
  document.body.replaceChildren();
});

/** A component whose shadow root holds a keyed list of inputs, mounted in the document. */
const makeList = (rows: Row[]) => {
  const items = signal(rows);
  const host = em.Panel(
    tags.ul(
      each(items, (row) => tags.li(tags.span(row.text), tags.input({ value: row.text })), {
        by: (row) => row.id,
      }),
    ),
  );
  mount(document.body, host);
  const root = host.shadowRoot!;
  const inputs = () => Array.from(root.querySelectorAll('input'));
  return { items, host, root, inputs };
};

describe('each: focus inside a shadow root', () => {
  it('restores the focus to the same place of a row that is rendered again in a new order', () => {
    const { items, host, root, inputs } = makeList([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    inputs()[1].focus();
    expect(root.activeElement).toBe(inputs()[1]);
    items.value = [
      { id: 3, text: 'c2' },
      { id: 2, text: 'b2' },
      { id: 1, text: 'a2' },
    ];
    expect(inputs().map((input) => input.value)).toEqual(['c2', 'b2', 'a2']);
    expect(root.activeElement).toBe(inputs()[1]);
    expect(document.activeElement).toBe(host);
  });

  it('keeps the focus on a row that only changes its place', () => {
    const rows = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ];
    const { items, root, inputs } = makeList(rows);
    const [first, second] = inputs();
    first.focus();
    items.value = [rows[1], rows[0]];
    expect(inputs()).toEqual([second, first]);
    expect(root.activeElement).toBe(first);
  });

  it('restores the focus of the row that changed and leaves the other rows alone', () => {
    const rows = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ];
    const { items, root, inputs } = makeList(rows);
    const [first, second] = inputs();
    second.focus();
    items.value = [rows[0], { id: 2, text: 'b2' }];
    expect(root.activeElement).toBe(inputs()[1]);
    expect(inputs()[0]).toBe(first);
  });
});
