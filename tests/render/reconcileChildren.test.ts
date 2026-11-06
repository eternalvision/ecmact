import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { em, tags } from '@em';
import { reconcileChildren, toNodes } from '@em/render/reconcileChildren';
import { resetWarnings } from '@em/utils/warn';
import { inner } from '@tests/helpers';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
  document.body.replaceChildren();
});

const list = () => document.createElement('ul');
const item = (key: string | number | undefined, content: string) => em.Item({ key, content });
const texts = (parent: Node) => Array.from(parent.childNodes, (node) => node.textContent);

describe('reconcileChildren text', () => {
  it('renders strings and numbers as text nodes in order', () => {
    const parent = list();
    reconcileChildren(parent, ['a', 1, 'b']);
    expect(texts(parent)).toEqual(['a', '1', 'b']);
  });

  it('skips false, true, null and undefined', () => {
    const parent = list();
    reconcileChildren(parent, ['a', false, null, undefined, true, 'b']);
    expect(texts(parent)).toEqual(['a', 'b']);
  });

  it('mixes text and elements', () => {
    const parent = list();
    const link = document.createElement('a');
    link.textContent = 'link';
    reconcileChildren(parent, ['before ', link, ' after']);
    expect(texts(parent)).toEqual(['before ', 'link', ' after']);
    expect(parent.children).toHaveLength(1);
  });

  it('reuses text nodes by position and updates their data', () => {
    const parent = list();
    reconcileChildren(parent, ['a', 'b']);
    const [first, second] = Array.from(parent.childNodes);
    reconcileChildren(parent, ['x', 'y']);
    expect(Array.from(parent.childNodes)).toEqual([first, second]);
    expect(texts(parent)).toEqual(['x', 'y']);
  });

  it('does not touch text that did not change', () => {
    const parent = list();
    reconcileChildren(parent, ['a']);
    const node = parent.firstChild as Text;
    const set = vi.fn();
    Object.defineProperty(node, 'data', { get: () => 'a', set });
    reconcileChildren(parent, ['a']);
    expect(set).not.toHaveBeenCalled();
  });

  it('adds text nodes when there are more strings than before', () => {
    const parent = list();
    reconcileChildren(parent, ['a']);
    reconcileChildren(parent, ['a', 'b', 'c']);
    expect(texts(parent)).toEqual(['a', 'b', 'c']);
  });

  it('removes text nodes that are no longer needed', () => {
    const parent = list();
    reconcileChildren(parent, ['a', 'b', 'c']);
    reconcileChildren(parent, ['a']);
    expect(texts(parent)).toEqual(['a']);
  });

  it('clears everything for an empty list', () => {
    const parent = list();
    reconcileChildren(parent, ['a', document.createElement('i')]);
    reconcileChildren(parent, []);
    expect(parent.childNodes).toHaveLength(0);
  });
});

describe('reconcileChildren nodes', () => {
  it('keeps the same node instances where they are', () => {
    const parent = list();
    const [a, b] = [document.createElement('i'), document.createElement('b')];
    reconcileChildren(parent, [a, b]);
    const insert = vi.spyOn(parent, 'insertBefore');
    reconcileChildren(parent, [a, b]);
    expect(Array.from(parent.children)).toEqual([a, b]);
    expect(insert).not.toHaveBeenCalled();
  });

  it('inserts only the new node when one is appended', () => {
    const parent = list();
    const [a, b, c] = ['i', 'b', 'u'].map((tag) => document.createElement(tag));
    reconcileChildren(parent, [a, b]);
    const insert = vi.spyOn(parent, 'insertBefore');
    reconcileChildren(parent, [a, b, c]);
    expect(Array.from(parent.children)).toEqual([a, b, c]);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('removes nodes that are not in the new list', () => {
    const parent = list();
    const [a, b] = [document.createElement('i'), document.createElement('b')];
    reconcileChildren(parent, [a, b]);
    reconcileChildren(parent, [b]);
    expect(Array.from(parent.children)).toEqual([b]);
    expect(a.parentNode).toBeNull();
  });

  it('replaces unkeyed components with the new instances', () => {
    const parent = list();
    const first = em.Item({ content: 'a' });
    const second = em.Item({ content: 'a' });
    reconcileChildren(parent, [first]);
    reconcileChildren(parent, [second]);
    expect(Array.from(parent.children)).toEqual([second]);
  });

  it('treats plain elements as unkeyed', () => {
    const parent = list();
    const first = document.createElement('li');
    const second = document.createElement('li');
    reconcileChildren(parent, [first]);
    reconcileChildren(parent, [second]);
    expect(Array.from(parent.children)).toEqual([second]);
  });
});

describe('reconcileChildren keys', () => {
  it('reuses the existing component and applies the new props to it', () => {
    const parent = list();
    const original = item(1, 'a');
    reconcileChildren(parent, [original]);
    const replacement = item(1, 'b');
    reconcileChildren(parent, [replacement]);
    expect(Array.from(parent.children)).toEqual([original]);
    expect(original.props.content).toBe('b');
    expect(inner(original).textContent).toBe('b');
    expect(replacement.parentNode).toBeNull();
  });

  it('keeps the inner element and its state', () => {
    const parent = list();
    const original = em.Field({ key: 1, tag: 'input' });
    reconcileChildren(parent, [original]);
    (inner(original) as HTMLInputElement).value = 'typed';
    const element = inner(original);
    reconcileChildren(parent, [em.Field({ key: 1, tag: 'input', placeholder: 'name' })]);
    expect(inner(original)).toBe(element);
    expect((inner(original) as HTMLInputElement).value).toBe('typed');
    expect(element.getAttribute('placeholder')).toBe('name');
  });

  it('reorders the existing components', () => {
    const parent = list();
    const [one, two, three] = [item(1, 'one'), item(2, 'two'), item(3, 'three')];
    reconcileChildren(parent, [one, two, three]);
    reconcileChildren(parent, [item(3, 'three'), item(1, 'one'), item(2, 'two')]);
    expect(Array.from(parent.children)).toEqual([three, one, two]);
  });

  it('moves only the components that are out of place', () => {
    const parent = list();
    const [one, two, three] = [item(1, 'one'), item(2, 'two'), item(3, 'three')];
    reconcileChildren(parent, [one, two, three]);
    const insert = vi.spyOn(parent, 'insertBefore');
    reconcileChildren(parent, [item(2, 'two'), item(3, 'three'), item(1, 'one')]);
    expect(Array.from(parent.children)).toEqual([two, three, one]);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('inserts new keys and removes missing ones', () => {
    const parent = list();
    const [one, two] = [item(1, 'one'), item(2, 'two')];
    reconcileChildren(parent, [one, two]);
    const added = item(3, 'three');
    reconcileChildren(parent, [item(2, 'two'), added]);
    expect(Array.from(parent.children)).toEqual([two, added]);
    expect(one.parentNode).toBeNull();
  });

  it('calls the new ref with the element that survives', () => {
    const parent = list();
    const original = item(1, 'a');
    reconcileChildren(parent, [original]);
    const ref = vi.fn();
    reconcileChildren(parent, [em.Item({ key: 1, content: 'b', ref })]);
    expect(ref).toHaveBeenLastCalledWith(original.element);
  });

  it('works without a ref', () => {
    const parent = list();
    reconcileChildren(parent, [item(1, 'a')]);
    expect(() => reconcileChildren(parent, [item(1, 'b')])).not.toThrow();
  });

  it('does not reuse a component of another kind with the same key', () => {
    const parent = list();
    const alpha = em.Alpha({ key: 1 });
    const beta = em.Beta({ key: 1 });
    reconcileChildren(parent, [alpha]);
    reconcileChildren(parent, [beta]);
    expect(Array.from(parent.children)).toEqual([beta]);
  });

  it('distinguishes number keys from string keys', () => {
    const parent = list();
    const numeric = item(1, 'number');
    const textual = item('1', 'string');
    reconcileChildren(parent, [numeric]);
    reconcileChildren(parent, [textual]);
    expect(Array.from(parent.children)).toEqual([textual]);
  });

  it('keeps the same instance when it is passed again', () => {
    const parent = list();
    const original = item(1, 'a');
    reconcileChildren(parent, [original]);
    reconcileChildren(parent, [original]);
    expect(Array.from(parent.children)).toEqual([original]);
  });

  it('warns about duplicate keys and renders both', () => {
    const parent = list();
    reconcileChildren(parent, [item(1, 'a'), item(1, 'b')]);
    expect(parent.children).toHaveLength(2);
    expect(spy).toHaveBeenCalledWith('ecmact: duplicate key "1" in children');
  });

  it('does not warn about repeated components without keys', () => {
    reconcileChildren(list(), [item(undefined, 'a'), item(undefined, 'b')]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('updates connected components in place', () => {
    const parent = list();
    document.body.append(parent);
    const original = item(1, 'a');
    reconcileChildren(parent, [original]);
    const element = inner(original);
    reconcileChildren(parent, [item(1, 'b')]);
    expect(inner(original)).toBe(element);
    expect(element.textContent).toBe('b');
  });

  it('works with the tag factories', () => {
    const parent = list();
    const original = tags.li({ key: 'a', content: 'one' });
    reconcileChildren(parent, [original]);
    reconcileChildren(parent, [tags.li({ key: 'a', content: 'two' })]);
    expect(Array.from(parent.children)).toEqual([original]);
    expect(inner(original).textContent).toBe('two');
  });
});

describe('toNodes', () => {
  it('drops empty values and turns numbers into strings', () => {
    const node = document.createElement('i');
    expect(toNodes(['a', 1, false, true, null, undefined, node])).toEqual(['a', '1', node]);
  });

  it('returns an empty list for no children', () => {
    expect(toNodes([])).toEqual([]);
  });
});
