import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@em';
import { build, createElement, isIgnoredKey, splitArgs } from '@em/core/element';
import { resetWarnings } from '@em/utils/warn';

let spy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  spy.mockRestore();
  resetWarnings();
});

describe('isIgnoredKey', () => {
  it('ignores symbols and then', () => {
    expect(isIgnoredKey(Symbol('x'))).toBe(true);
    expect(isIgnoredKey('then')).toBe(true);
  });

  it('accepts ordinary names', () => {
    expect(isIgnoredKey('div')).toBe(false);
  });
});

describe('splitArgs', () => {
  it('takes a plain object first as the props', () => {
    const props = { id: 'a' };
    expect(splitArgs([props, 'x', 'y'])).toEqual([props, ['x', 'y']]);
  });

  it('treats everything else as children', () => {
    const node = document.createElement('i');
    const list = ['a'];
    const count = signal(1);
    const fn = () => 'x';
    expect(splitArgs([node, 'x'])).toEqual([{}, [node, 'x']]);
    expect(splitArgs([list])).toEqual([{}, [list]]);
    expect(splitArgs([count])).toEqual([{}, [count]]);
    expect(splitArgs([fn])).toEqual([{}, [fn]]);
    expect(splitArgs([null, 'x'])).toEqual([{}, [null, 'x']]);
    expect(splitArgs([])).toEqual([{}, []]);
  });
});

describe('createElement', () => {
  it('creates a plain element with props and children', () => {
    const element = createElement('p', [{ class: 'note' }, 'Hello, ', document.createElement('b')]);
    expect(element.outerHTML).toBe('<p class="note">Hello, <b></b></p>');
  });

  it('creates an element from children only', () => {
    expect(createElement('span', ['a', 1]).outerHTML).toBe('<span>a1</span>');
  });

  it('calls ref with the finished element', () => {
    const ref = vi.fn((element: HTMLElement) => expect(element.textContent).toBe('x'));
    const element = createElement('div', [{ ref }, 'x']);
    expect(ref).toHaveBeenCalledWith(element);
  });

  it('sets the value of a select after its options are in place', () => {
    const option = (value: string) => createElement('option', [{ value }, value]);
    const select = createElement('select', [{ value: 'b' }, option('a'), option('b')]);
    expect((select as HTMLSelectElement).value).toBe('b');
  });
});

describe('build: html', () => {
  it('sets trusted markup and ignores the children with a warning', () => {
    const element = createElement('div', [{ html: '<b>bold</b>' }, 'ignored']);
    expect(element.innerHTML).toBe('<b>bold</b>');
    expect(spy).toHaveBeenCalledWith('ecmact: children are ignored when html is set');
  });

  it('does not warn without children', () => {
    createElement('div', [{ html: 'x' }]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('follows reactive markup and clears it for empty values', () => {
    const html = signal<string | null>('<i>a</i>');
    const element = createElement('div', [{ html }]);
    expect(element.innerHTML).toBe('<i>a</i>');
    html.value = null;
    expect(element.innerHTML).toBe('');
  });

  it('puts the content into the root and the props on the element', () => {
    const element = document.createElement('div');
    const root = element.attachShadow({ mode: 'open' });
    build(element, root, { id: 'host' }, ['inside']);
    expect(element.id).toBe('host');
    expect(root.textContent).toBe('inside');
    expect(element.childNodes).toHaveLength(0);
  });
});
