import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, effect, em, signal } from '../src';
import { resetConfig, configure } from '../src/config';
import { inner } from './helpers';

afterEach(() => {
  resetConfig();
  document.body.replaceChildren();
});

describe('props', () => {
  it('renders the initial props', () => {
    const card = em.Card({ content: 'a', title: 't' });
    expect(inner(card).textContent).toBe('a');
    expect(card.props).toEqual({ content: 'a', title: 't' });
  });

  it('replaces all props when assigned', () => {
    const card = em.Card({ content: 'a', title: 't' });
    card.props = { content: 'b' };
    expect(card.props).toEqual({ content: 'b' });
    expect(inner(card).hasAttribute('title')).toBe(false);
  });

  it('merges new props into the existing ones with setState', () => {
    const card = em.Card({ content: 'a', title: 't' });
    card.setState({ content: 'b' });
    expect(card.props).toMatchObject({ content: 'b', title: 't' });
    expect(inner(card).textContent).toBe('b');
  });

  it('removes attributes set to undefined', () => {
    const card = em.Card({ title: 'a', lang: 'en' });
    card.setState({ title: undefined });
    expect(inner(card).hasAttribute('title')).toBe(false);
    expect(inner(card).getAttribute('lang')).toBe('en');
  });

  it('replaces handlers on update without duplicating them', () => {
    const first = vi.fn();
    const second = vi.fn();
    const card = em.Card({ onclick: first });
    card.setState({ onclick: second });
    inner(card).click();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('renders on connect when props were never set', () => {
    const element = document.createElement('em-card') as ReturnType<typeof em.Card>;
    document.body.append(element);
    expect(inner(element).localName).toBe('div');
  });
});

describe('updates', () => {
  it('reuses the element between renders', () => {
    const card = em.Card({ content: 'a' });
    const before = inner(card);
    card.setState({ content: 'b' });
    expect(inner(card)).toBe(before);
  });

  it('keeps input state between renders', () => {
    const field = em.Field({ tag: 'input' });
    (inner(field) as HTMLInputElement).value = 'typed';
    field.setState({ placeholder: 'name' });
    expect((inner(field) as HTMLInputElement).value).toBe('typed');
  });

  it('recreates the element when the tag changes', () => {
    const card = em.Card({ tag: 'div' as string });
    const before = inner(card);
    card.setState({ tag: 'section' });
    expect(inner(card)).not.toBe(before);
    expect(inner(card).localName).toBe('section');
  });

  it('does not render again on connect when already rendered', () => {
    const card = em.Card({ content: 'a' });
    const before = inner(card);
    document.body.append(card);
    expect(inner(card)).toBe(before);
  });
});

describe('shadow option', () => {
  it('renders into an open shadow root by default', () => {
    const card = em.Card({ content: 'x' });
    expect(inner(card).textContent).toBe('x');
    expect(card.children).toHaveLength(0);
  });

  it('renders into the host when shadow is false', () => {
    const card = em.Card({ shadow: false, content: 'x' });
    expect(card.shadowRoot).toBeNull();
    expect(card.firstElementChild?.textContent).toBe('x');
  });

  it('is visible to global selectors when shadow is false', () => {
    document.body.append(em.Card({ shadow: false, class: 'box' }));
    expect(document.querySelector('em-card > div.box')).not.toBeNull();
  });

  it('updates in place when shadow is false', () => {
    const field = em.Field({ shadow: false, tag: 'input' });
    const before = field.firstElementChild;
    field.setState({ placeholder: 'name' });
    expect(field.firstElementChild).toBe(before);
    expect(field.childElementCount).toBe(1);
  });

  it('is read on the first render only', () => {
    const card = em.Card({ content: 'a' });
    card.setState({ shadow: false });
    expect(card.shadowRoot?.firstElementChild).not.toBeNull();
    expect(card.children).toHaveLength(0);
  });

  it('follows the configured default', () => {
    configure({ shadow: false });
    expect(em.Card({ content: 'x' }).shadowRoot).toBeNull();
  });

  it('lets the component override the configured default', () => {
    configure({ shadow: false });
    expect(em.Card({ shadow: true }).shadowRoot).not.toBeNull();
  });
});

describe('mounted', () => {
  it('runs on connect with the inner element and the component', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    expect(mounted).not.toHaveBeenCalled();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledWith(inner(card), card);
  });

  it('runs on every reconnect', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(2);
  });

  it('works with shadow false', () => {
    const mounted = vi.fn();
    const card = em.Card({ shadow: false, mounted });
    document.body.append(card);
    expect(mounted).toHaveBeenCalledWith(card.firstElementChild, card);
  });

  it('lets a hook update the component', () => {
    const card = em.Card({
      content: 'before',
      mounted: (_, component) => component.setState({ content: 'after' }),
    });
    document.body.append(card);
    expect(inner(card).textContent).toBe('after');
  });
});

describe('cleanup returned from mounted', () => {
  it('runs on disconnect before unmounted', () => {
    const order: string[] = [];
    const card = em.Card({
      mounted: () => () => order.push('cleanup'),
      unmounted: () => order.push('unmounted'),
    });
    document.body.append(card);
    expect(order).toEqual([]);
    card.remove();
    expect(order).toEqual(['cleanup', 'unmounted']);
  });

  it('runs once per mount cycle', () => {
    const cleanup = vi.fn();
    const mounted = vi.fn(() => cleanup);
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    card.remove();
    expect(mounted).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('is not called again when disconnected twice', () => {
    const cleanup = vi.fn();
    const card = em.Card({ mounted: () => cleanup });
    document.body.append(card);
    card.remove();
    card.disconnectedCallback();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('is optional', () => {
    const card = em.Card({ mounted: () => {} });
    document.body.append(card);
    expect(() => card.remove()).not.toThrow();
  });
});

describe('unmounted', () => {
  it('runs on disconnect with the inner element and the component', () => {
    const unmounted = vi.fn();
    const card = em.Card({ unmounted });
    document.body.append(card);
    expect(unmounted).not.toHaveBeenCalled();
    card.remove();
    expect(unmounted).toHaveBeenCalledWith(inner(card), card);
  });

  it('uses the latest props', () => {
    const first = vi.fn();
    const second = vi.fn();
    const card = em.Card({ unmounted: first });
    document.body.append(card);
    card.setState({ unmounted: second });
    card.remove();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('updated', () => {
  it('does not run on the first render', () => {
    const updated = vi.fn();
    document.body.append(em.Card({ updated }));
    expect(updated).not.toHaveBeenCalled();
  });

  it('runs after every later render with the element, the component and the previous props', () => {
    const updated = vi.fn();
    const card = em.Card({ content: 'a', updated });
    card.setState({ content: 'b' });
    card.setState({ content: 'c' });
    expect(updated).toHaveBeenCalledTimes(2);
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect(updated.mock.calls[0][1]).toBe(card);
    expect(updated.mock.calls[0][2]).toMatchObject({ content: 'a' });
    expect(updated.mock.calls[1][2]).toMatchObject({ content: 'b' });
  });

  it('receives the new element when the tag changes', () => {
    const updated = vi.fn();
    const card = em.Card({ tag: 'div' as string, updated });
    card.setState({ tag: 'section' });
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect((updated.mock.calls[0][0] as HTMLElement).localName).toBe('section');
  });
});

describe('beforeUpdate', () => {
  it('does not run on the first render', () => {
    const beforeUpdate = vi.fn();
    em.Card({ beforeUpdate });
    expect(beforeUpdate).not.toHaveBeenCalled();
  });

  it('receives next props, current props and the component', () => {
    const beforeUpdate = vi.fn();
    const card = em.Card({ content: 'a', beforeUpdate });
    card.setState({ content: 'b' });
    const [next, current, component] = beforeUpdate.mock.calls[0];
    expect(next.content).toBe('b');
    expect(current.content).toBe('a');
    expect(component).toBe(card);
  });

  it('cancels the update when it returns false', () => {
    const updated = vi.fn();
    const card = em.Card({ content: 'a', beforeUpdate: () => false, updated });
    card.setState({ content: 'b' });
    expect(inner(card).textContent).toBe('a');
    expect(card.props.content).toBe('a');
    expect(updated).not.toHaveBeenCalled();
  });

  it('allows the update when it returns true or nothing', () => {
    const decide = vi.fn<() => boolean | void>();
    const card = em.Card({ content: 'a', beforeUpdate: decide });
    decide.mockReturnValueOnce(true);
    card.setState({ content: 'b' });
    decide.mockReturnValueOnce(undefined);
    card.setState({ content: 'c' });
    expect(inner(card).textContent).toBe('c');
  });

  it('can skip updates that change nothing', () => {
    const card = em.Card({
      content: 'a',
      beforeUpdate: (next, current) => next.content !== current.content,
    });
    const child = document.createElement('i');
    card.setState({ children: [child] });
    expect(inner(card).contains(child)).toBe(false);
    card.setState({ content: 'b' });
    expect(inner(card).textContent).toBe('b');
  });
});

describe('signals', () => {
  const text = (component: HTMLElement) => inner(component).textContent;

  it('renders the current value of a signal prop', () => {
    const label = signal('a');
    expect(text(em.Card({ content: label }))).toBe('a');
  });

  it('updates the DOM when a signal changes while connected', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    label.value = 'b';
    expect(text(card)).toBe('b');
  });

  it('keeps the element when a signal changes', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    const before = inner(card);
    label.value = 'b';
    expect(inner(card)).toBe(before);
  });

  it('does not subscribe before the component is connected', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    label.value = 'b';
    expect(text(card)).toBe('a');
  });

  it('stops following signals after disconnect', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    expect(text(card)).toBe('a');
  });

  it('catches up with changes made while disconnected when it reconnects', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    document.body.append(card);
    expect(text(card)).toBe('b');
    label.value = 'c';
    expect(text(card)).toBe('c');
  });

  it('does not repaint on reconnect when nothing changed', () => {
    const updated = vi.fn();
    const card = em.Card({ content: signal('a'), updated });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    expect(updated).not.toHaveBeenCalled();
  });

  it('can veto the repaint on reconnect', () => {
    const label = signal('a');
    const card = em.Card({ content: label, beforeUpdate: () => false });
    document.body.append(card);
    card.remove();
    label.value = 'b';
    document.body.append(card);
    expect(text(card)).toBe('a');
  });

  it('resolves computed signals', () => {
    const count = signal(1);
    const card = em.Card({ content: computed(() => `count ${count.value}`) });
    document.body.append(card);
    count.value = 2;
    expect(text(card)).toBe('count 2');
  });

  it('applies signals in attributes', () => {
    const title = signal('a');
    const card = em.Card({ title });
    document.body.append(card);
    title.value = 'b';
    expect(inner(card).getAttribute('title')).toBe('b');
  });

  it('applies signals in style values and in the whole style', () => {
    const color = signal('red');
    const style = signal({ margin: '1px' });
    const card = em.Card({ style: { color } });
    const other = em.Card({ style });
    document.body.append(card, other);
    color.value = 'blue';
    style.value = { margin: '2px' };
    expect(inner(card).style.color).toBe('blue');
    expect(inner(other).style.margin).toBe('2px');
  });

  it('applies a css signal', () => {
    const css = signal('div { color: red; }');
    const card = em.Card({ css });
    document.body.append(card);
    css.value = 'div { color: blue; }';
    expect(card.shadowRoot!.adoptedStyleSheets).toHaveLength(1);
  });

  it('follows the signals of the new props after setState', () => {
    const first = signal('first');
    const second = signal('second');
    const card = em.Card({ content: first });
    document.body.append(card);
    card.setState({ content: second });
    first.value = 'ignored';
    expect(text(card)).toBe('second');
    second.value = 'changed';
    expect(text(card)).toBe('changed');
  });

  it('stops following a signal that setState replaced with a plain value', () => {
    const label = signal('a');
    const card = em.Card({ content: label });
    document.body.append(card);
    card.setState({ content: 'plain' });
    label.value = 'b';
    expect(text(card)).toBe('plain');
  });

  it('exposes the raw props, with the signals', () => {
    const label = signal('a');
    expect(em.Card({ content: label }).props.content).toBe(label);
  });

  it('calls updated with the resolved current and previous props', () => {
    const label = signal('a');
    const updated = vi.fn();
    const card = em.Card({ content: label, updated });
    document.body.append(card);
    label.value = 'b';
    expect(updated).toHaveBeenCalledTimes(1);
    expect(updated.mock.calls[0][0]).toBe(inner(card));
    expect(updated.mock.calls[0][1]).toBe(card);
    expect(updated.mock.calls[0][2]).toMatchObject({ content: 'a' });
  });

  it('runs beforeUpdate with resolved values and can veto signal updates', () => {
    const label = signal('a');
    const beforeUpdate = vi.fn(() => false);
    const card = em.Card({ content: label, beforeUpdate });
    document.body.append(card);
    label.value = 'b';
    const [next, current] = beforeUpdate.mock.calls[0] as unknown as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(next.content).toBe('b');
    expect(current.content).toBe('a');
    expect(text(card)).toBe('a');
  });

  it('keeps tracking after a vetoed update', () => {
    const label = signal('a');
    let allow = false;
    const card = em.Card({ content: label, beforeUpdate: () => allow });
    document.body.append(card);
    label.value = 'b';
    allow = true;
    label.value = 'c';
    expect(text(card)).toBe('c');
  });

  it('does not make the surrounding effect depend on the props it resolves', () => {
    const label = signal('a');
    const outer = signal(0);
    const run = vi.fn(() => {
      void outer.value;
      document.body.append(em.Card({ content: label }));
    });
    effect(run);
    label.value = 'b';
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('does not make the surrounding effect depend on hook reads', () => {
    const inside = signal(0);
    const outer = signal(0);
    const run = vi.fn(() => {
      void outer.value;
      document.body.append(em.Card({ mounted: () => void inside.value }));
    });
    effect(run);
    inside.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });
});
