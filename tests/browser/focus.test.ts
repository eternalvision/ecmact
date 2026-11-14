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
  it('restores the focus to the row that was focused, wherever the reorder puts it', () => {
    const { items, host, root, inputs } = makeList([
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    inputs()[0].focus();
    expect(root.activeElement).toBe(inputs()[0]);
    items.value = [
      { id: 3, text: 'c2' },
      { id: 2, text: 'b2' },
      { id: 1, text: 'a2' },
    ];
    expect(inputs().map((input) => input.value)).toEqual(['c2', 'b2', 'a2']);
    // the row moved from the first to the last place, and the focus went with it, not with the index
    expect(root.activeElement).toBe(inputs()[2]);
    expect(inputs()[2].value).toBe('a2');
    expect(document.activeElement).toBe(host);
  });

  it('a focused row that the reorder does not move keeps the focus', () => {
    const rows = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ];
    const { items, root, inputs } = makeList(rows);
    const [first, second] = inputs();
    first.focus();
    items.value = [rows[1], rows[0]];
    expect(inputs()).toEqual([second, first]);
    // the reorder moves the other row and leaves the focused one where it is, so its focus is not touched
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

it('tmp failing assertion', () => {
  expect(1 + 1).toBe(3);
});
