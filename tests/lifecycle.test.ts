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
    expect(mounted).toHaveBeenCalledWith(card.shadowRoot?.firstElementChild);
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
    expect(mounted).toHaveBeenCalledWith(element.firstElementChild);
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
    expect(unmounted).toHaveBeenCalledWith(card.shadowRoot?.firstElementChild);
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
    expect(updated).toHaveBeenLastCalledWith(card.shadowRoot?.firstElementChild);
    expect(card.shadowRoot?.firstElementChild?.textContent).toBe('b');
  });

  it('receives the new element when the tag changes', () => {
    const updated = vi.fn();
    const card = em.Card({ tag: 'div' as string, updated });
    card.setState({ tag: 'section' });
    expect(updated).toHaveBeenCalledWith(card.shadowRoot?.firstElementChild);
    expect((updated.mock.calls[0][0] as HTMLElement).localName).toBe('section');
  });
});
