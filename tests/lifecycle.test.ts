import { afterEach, describe, expect, it, vi } from 'vitest';
import { em } from '../src';

afterEach(() => {
  document.body.replaceChildren();
});

describe('shadow option', () => {
  it('renders into an open shadow root by default', () => {
    const card = em.Card({ content: 'x' });
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('x');
    expect(card.children).toHaveLength(0);
  });

  it('renders into the host when shadow is false', () => {
    const card = em.Card({ shadow: false, content: 'x' });
    expect(card.shadowRoot).toBeNull();
    expect(card.firstElementChild?.textContent).toBe('x');
  });

  it('is visible to global selectors when shadow is false', () => {
    const card = em.Card({ shadow: false, class: 'box' });
    document.body.append(card);
    expect(document.querySelector('em-card > div.box')).not.toBeNull();
  });

  it('updates in place when shadow is false', () => {
    const field = em.Field({ shadow: false, tag: 'input', onclick: vi.fn() });
    const before = field.firstElementChild;
    field.setState({ placeholder: 'name', style: { color: 'red' } });
    expect(field.firstElementChild).toBe(before);
    expect(field.firstElementChild?.getAttribute('placeholder')).toBe('name');
    expect(field.childElementCount).toBe(1);
  });

  it('does not render shadow as an attribute', () => {
    const card = em.Card({ shadow: false });
    expect(card.firstElementChild?.hasAttribute('shadow')).toBe(false);
  });

  it('reads the option on the first render only', () => {
    const card = em.Card({ content: 'a' });
    card.setState({ shadow: false });
    expect(card.shadowRoot?.firstElementChild).not.toBeNull();
    expect(card.children).toHaveLength(0);
  });
});

describe('mounted', () => {
  it('runs on connect with the inner element', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    expect(mounted).not.toHaveBeenCalled();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledWith(card.shadowRoot?.firstElementChild, card);
  });

  it('runs on every reconnect', () => {
    const mounted = vi.fn();
    const card = em.Card({ mounted });
    document.body.append(card);
    card.remove();
    document.body.append(card);
    expect(mounted).toHaveBeenCalledTimes(2);
  });

  it('sees the rendered element when the host was created without props', () => {
    const element = document.createElement('em-card') as ReturnType<typeof em.Card>;
    const mounted = vi.fn();
    element.props = { mounted, shadow: false };
    document.body.append(element);
    expect(mounted).toHaveBeenCalledWith(element.firstElementChild, element);
  });

  it('works with shadow false', () => {
    const mounted = vi.fn();
    document.body.append(em.Card({ shadow: false, mounted }));
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('is not rendered as an attribute', () => {
    const card = em.Card({ mounted: () => {}, unmounted: () => {}, updated: () => {} });
    expect(card.shadowRoot?.firstElementChild?.getAttributeNames()).toEqual([]);
  });
});

describe('unmounted', () => {
  it('runs on disconnect with the inner element', () => {
    const unmounted = vi.fn();
    const card = em.Card({ unmounted });
    document.body.append(card);
    expect(unmounted).not.toHaveBeenCalled();
    card.remove();
    expect(unmounted).toHaveBeenCalledTimes(1);
    expect(unmounted).toHaveBeenCalledWith(card.shadowRoot?.firstElementChild, card);
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
    const card = em.Card({ updated });
    document.body.append(card);
    expect(updated).not.toHaveBeenCalled();
  });

  it('runs after every later render with the inner element', () => {
    const updated = vi.fn();
    const card = em.Card({ updated });
    card.setState({ content: 'a' });
    card.setState({ content: 'b' });
    expect(updated).toHaveBeenCalledTimes(2);
    expect(updated).toHaveBeenLastCalledWith(
      card.shadowRoot?.firstElementChild,
      card,
      expect.objectContaining({ content: 'a' }),
    );
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('b');
  });

  it('receives the new element when the tag changes', () => {
    const updated = vi.fn();
    const card = em.Card({ tag: 'div' as string, updated });
    card.setState({ tag: 'section' });
    expect(updated).toHaveBeenCalledWith(
      card.shadowRoot?.firstElementChild,
      card,
      expect.anything(),
    );
    expect((updated.mock.calls[0][0] as HTMLElement).localName).toBe('section');
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

  it('is not called again when removed twice', () => {
    const cleanup = vi.fn();
    const card = em.Card({ mounted: () => cleanup });
    document.body.append(card);
    card.remove();
    card.disconnectedCallback();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('ignores a mounted hook that returns nothing', () => {
    const card = em.Card({ mounted: () => {} });
    document.body.append(card);
    expect(() => card.remove()).not.toThrow();
  });
});

describe('component argument', () => {
  it('is the host in every hook', () => {
    const seen: unknown[] = [];
    const card = em.Card({
      mounted: (_, component) => void seen.push(component),
      updated: (_, component) => void seen.push(component),
      unmounted: (_, component) => void seen.push(component),
    });
    document.body.append(card);
    card.setState({ content: 'x' });
    card.remove();
    expect(seen).toEqual([card, card, card]);
  });

  it('lets a hook update the component', () => {
    const card = em.Card({
      content: 'before',
      mounted: (_, component) => component.setState({ content: 'after' }),
    });
    document.body.append(card);
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('after');
  });
});

describe('updated previous props', () => {
  it('receives the props from before the update', () => {
    const updated = vi.fn();
    const card = em.Card({ content: 'a', updated });
    card.setState({ content: 'b' });
    card.setState({ content: 'c' });
    expect(updated.mock.calls[0][2]).toMatchObject({ content: 'a' });
    expect(updated.mock.calls[1][2]).toMatchObject({ content: 'b' });
    expect(card.props.content).toBe('c');
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
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('a');
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
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('c');
  });

  it('can skip updates that change nothing', () => {
    const card = em.Card({
      content: 'a',
      beforeUpdate: (next, current) => next.content !== current.content,
    });
    const before = card.shadowRoot?.firstElementChild;
    const child = document.createElement('i');
    card.setState({ children: [child] });
    card.setState({ content: 'a' });
    expect(before?.contains(child)).toBe(false);
  });

  it('is not rendered as an attribute', () => {
    const card = em.Card({ beforeUpdate: () => true });
    expect(card.shadowRoot?.firstElementChild?.getAttributeNames()).toEqual([]);
  });
});
