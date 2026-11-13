import { describe, expect, it, vi } from 'vitest';
import { signal, tags } from '@em';
import { bind } from '@em/render/bindings';
import { appendChildren, fill, toNodes } from '@em/render/children';

const html = (element: Element) => element.innerHTML.replaceAll('<!---->', '');

describe('toNodes', () => {
  it('turns text and numbers into text nodes and keeps nodes', () => {
    const span = document.createElement('span');
    const nodes = toNodes(['a', 1, span]);
    expect(nodes.map((node) => node.textContent)).toEqual(['a', '1', '']);
    expect(nodes[2]).toBe(span);
  });

  it('drops empty values', () => {
    expect(toNodes([null, undefined, true, false, ''])).toEqual([]);
  });

  it('flattens nested lists and fragments', () => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createElement('i'), document.createElement('b'));
    const nodes = toNodes(['a', ['b', ['c']], fragment]);
    expect(nodes).toHaveLength(5);
    expect((nodes[4] as Element).localName).toBe('b');
  });

  it('adds to a list that is passed in', () => {
    const nodes = [document.createTextNode('x')];
    expect(toNodes('y', nodes)).toBe(nodes);
    expect(nodes).toHaveLength(2);
  });
});

describe('appendChildren', () => {
  it('appends to an element', () => {
    const parent = document.createElement('p');
    appendChildren(parent, ['See ', document.createElement('a'), ' now']);
    expect(parent.innerHTML).toBe('See <a></a> now');
  });
});

describe('reactive children', () => {
  it('renders a signal of text as one text node and updates it in place', () => {
    const name = signal('Ada');
    const parent = document.createElement('p');
    appendChildren(parent, ['Hello, ', name, '!']);
    const text = parent.childNodes[1];
    expect(parent.childNodes).toHaveLength(3);
    expect(parent.textContent).toBe('Hello, Ada!');
    name.value = 'Grace';
    expect(parent.childNodes[1]).toBe(text);
    expect(parent.textContent).toBe('Hello, Grace!');
  });

  it('renders a function and follows the signals it reads', () => {
    const count = signal(0);
    const parent = document.createElement('p');
    appendChildren(parent, () => `count is ${count.value}`);
    count.value = 2;
    expect(parent.textContent).toBe('count is 2');
  });

  it('renders nothing for empty values and numbers as text', () => {
    const value = signal<number | boolean | null | undefined>(null);
    const parent = document.createElement('p');
    appendChildren(parent, value);
    expect(parent.textContent).toBe('');
    value.value = 3;
    expect(parent.textContent).toBe('3');
    value.value = false;
    expect(parent.textContent).toBe('');
    value.value = undefined;
    expect(parent.textContent).toBe('');
  });

  it('switches between nodes, lists and text', () => {
    const view = signal<unknown>('text');
    const parent = document.createElement('div');
    appendChildren(parent, ['[', view as never, ']']);
    view.value = document.createElement('b');
    expect(html(parent)).toBe('[<b></b>]');
    view.value = [document.createElement('i'), 'x'];
    expect(html(parent)).toBe('[<i></i>x]');
    view.value = 'plain';
    expect(html(parent)).toBe('[plain]');
    view.value = [];
    expect(html(parent)).toBe('[]');
  });

  it('renders nodes on the first run', () => {
    const show = signal(true);
    const panel = document.createElement('section');
    const parent = document.createElement('div');
    appendChildren(parent, () => (show.value ? panel : null));
    expect(html(parent)).toBe('<section></section>');
    show.value = false;
    expect(html(parent)).toBe('');
    show.value = true;
    expect(parent.contains(panel)).toBe(true);
  });

  it('keeps a node that is returned again', () => {
    const tick = signal(0);
    const kept = document.createElement('input');
    const parent = document.createElement('div');
    appendChildren(parent, () => [kept, String(tick.value)]);
    tick.value = 1;
    expect(parent.firstElementChild).toBe(kept);
    expect(parent.textContent).toBe('1');
  });

  it('pauses what it removes and resumes what comes back', () => {
    const show = signal(true);
    const count = signal(0);
    const label = tags.span(() => String(count.value));
    const parent = document.createElement('div');
    appendChildren(parent, () => (show.value ? label : null));
    show.value = false;
    count.value = 1;
    expect(label.textContent).toBe('0');
    show.value = true;
    expect(label.textContent).toBe('1');
  });

  it('nests regions', () => {
    const outer = signal(true);
    const inner = signal('a');
    const parent = document.createElement('div');
    appendChildren(parent, () => (outer.value ? [tags.b(), inner] : 'off'));
    inner.value = 'b';
    expect(html(parent)).toBe('<b></b>b');
    outer.value = false;
    expect(html(parent)).toBe('off');
    inner.value = 'c';
    expect(html(parent)).toBe('off');
  });

  it('stops the bindings of nested regions that are removed', () => {
    const outer = signal(true);
    const run = vi.fn();
    const parent = document.createElement('div');
    const tracked = signal(0);
    appendChildren(parent, () =>
      outer.value
        ? [
            () => {
              run(tracked.value);
              return [document.createElement('i')];
            },
          ]
        : null,
    );
    outer.value = false;
    tracked.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });
});

describe('fill', () => {
  const setup = (count: number) => {
    const parent = document.createElement('div');
    const start = document.createComment('');
    const end = document.createComment('');
    const nodes = Array.from({ length: count }, (_, index) => {
      const node = document.createElement('i');
      node.id = `n${index}`;
      return node;
    });
    parent.append(start, ...nodes, end);
    const ids = () => Array.from(parent.children, (child) => child.id);
    return { parent, start, end, nodes, ids };
  };

  it('moves only the nodes that are out of order', () => {
    const { parent, start, end, nodes, ids } = setup(5);
    const insert = vi.spyOn(parent, 'insertBefore');
    fill(start, end, [nodes[1], nodes[2], nodes[3], nodes[4], nodes[0]]);
    expect(ids()).toEqual(['n1', 'n2', 'n3', 'n4', 'n0']);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('reverses, removes and inserts', () => {
    const { start, end, nodes, ids } = setup(4);
    const fresh = document.createElement('i');
    fresh.id = 'new';
    fill(start, end, [nodes[3], fresh, nodes[2], nodes[0]]);
    expect(ids()).toEqual(['n3', 'new', 'n2', 'n0']);
    expect(nodes[1].isConnected).toBe(false);
  });

  it('empties the range and leaves what is outside it', () => {
    const { parent, start, end, ids } = setup(2);
    parent.prepend(document.createElement('b'));
    fill(start, end, []);
    expect(ids()).toEqual(['']);
  });

  it('pauses the nodes it removes', () => {
    const { start, end, nodes } = setup(1);
    const count = signal(0);
    const run = vi.fn(() => void count.value);
    bind(nodes[0], run);
    fill(start, end, []);
    count.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });
});
