import { describe, expect, it, vi } from 'vitest';
import { render } from '../../src/utils/render';
import type { ResolvedProps } from '../../src';
import { createRoot, createState } from '../helpers';

const setup = (props: ResolvedProps = {}) => {
  const root = createRoot();
  const state = createState();
  const element = render(root, props, state);
  return { root, state, element };
};

describe('render', () => {
  it('renders a div with text content by default', () => {
    const { root, element } = setup({ content: 'hello' });
    expect(root.firstElementChild).toBe(element);
    expect(element.localName).toBe('div');
    expect(element.textContent).toBe('hello');
  });

  it('renders an empty div without props', () => {
    expect(setup().element.textContent).toBe('');
  });

  it('renders the given tag', () => {
    expect(setup({ tag: 'h1' }).element.localName).toBe('h1');
  });

  it('does not interpret content as html', () => {
    const { element } = setup({ content: '<img src=x onerror=alert(1)>' });
    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('renders html when it is provided', () => {
    expect(setup({ html: '<b>bold</b>' }).element.querySelector('b')?.textContent).toBe('bold');
  });

  it('ignores content when html is provided', () => {
    expect(setup({ html: '<b>a</b>', content: 'text' }).element.textContent).toBe('a');
  });

  it('appends children after html', () => {
    const child = document.createElement('span');
    const { element } = setup({ html: '<b>bold</b>', children: [child] });
    expect(element.lastElementChild).toBe(child);
  });

  it('appends children after the content', () => {
    const child = document.createElement('span');
    const { element } = setup({ content: 'text', children: [child] });
    expect(element.firstChild?.textContent).toBe('text');
    expect(element.lastElementChild).toBe(child);
  });

  it('applies attributes, styles and listeners', () => {
    const onclick = vi.fn();
    const { element, state } = setup({ title: 'a', style: { color: 'red' }, onclick });
    element.click();
    expect(element.getAttribute('title')).toBe('a');
    expect(element.style.color).toBe('red');
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(state.attributes).toEqual(new Set(['title']));
    expect(state.styles).toEqual(new Set(['color']));
    expect(state.listeners.size).toBe(1);
  });

  it('calls ref once when the element is created', () => {
    const ref = vi.fn();
    const root = createRoot();
    const state = createState();
    const element = render(root, { ref }, state);
    render(root, { ref, content: 'again' }, state);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(element);
  });

  it('reuses the element between renders', () => {
    const root = createRoot();
    const state = createState();
    const first = render(root, { content: 'a' }, state);
    const second = render(root, { content: 'b' }, state);
    expect(second).toBe(first);
    expect(second.textContent).toBe('b');
  });

  it('compares tags case-insensitively', () => {
    const root = createRoot();
    const state = createState();
    const first = render(root, { tag: 'div' }, state);
    expect(render(root, { tag: 'DIV' }, state)).toBe(first);
  });

  it('creates a fresh element and state when the tag changes', () => {
    const root = createRoot();
    const state = createState();
    const first = render(root, { tag: 'div', title: 'a', onclick: () => {} }, state);
    const ref = vi.fn();
    const second = render(root, { tag: 'section', ref }, state);
    expect(second).not.toBe(first);
    expect(second.hasAttribute('title')).toBe(false);
    expect(root.children).toHaveLength(1);
    expect(root.firstElementChild).toBe(second);
    expect(ref).toHaveBeenCalledWith(second);
  });

  it('removes stale attributes, styles and listeners on re-render', () => {
    const root = createRoot();
    const state = createState();
    const onclick = vi.fn();
    const element = render(root, { title: 'a', style: { color: 'red' }, onclick }, state);
    render(root, {}, state);
    element.click();
    expect(element.hasAttribute('title')).toBe(false);
    expect(element.style.color).toBe('');
    expect(onclick).not.toHaveBeenCalled();
  });

  it('adopts the css prop in a shadow root', () => {
    const { root } = setup({ css: 'div { color: red; }' });
    expect(root.adoptedStyleSheets).toHaveLength(1);
  });

  it('ignores css when the root is not a shadow root', () => {
    const host = document.createElement('div');
    const element = render(host, { css: 'div { color: red; }' }, createState());
    expect(host.firstElementChild).toBe(element);
    expect(host.querySelector('style')).toBeNull();
  });

  it('replaces whatever the light DOM host contained', () => {
    const host = document.createElement('div');
    host.append(document.createElement('p'));
    const element = render(host, {}, createState());
    expect(host.children).toHaveLength(1);
    expect(host.firstElementChild).toBe(element);
  });
});
