import { describe, expect, it, vi } from 'vitest';
import { em, type Component } from '../src';

const inner = (component: Component) => component.shadowRoot!.firstElementChild as HTMLElement;

describe('render', () => {
  it('renders a div with text content by default', () => {
    const card = em.Card({ content: 'hello' });
    expect(inner(card).localName).toBe('div');
    expect(inner(card).textContent).toBe('hello');
  });

  it('renders the given tag', () => {
    const heading = em.Heading({ tag: 'h1', content: 'title' });
    expect(inner(heading).localName).toBe('h1');
  });

  it('does not interpret content as html', () => {
    const card = em.Card({ content: '<img src=x onerror=alert(1)>' });
    expect(inner(card).querySelector('img')).toBeNull();
    expect(inner(card).textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('renders html when explicitly provided', () => {
    const card = em.Card({ html: '<b>bold</b>' });
    expect(inner(card).querySelector('b')?.textContent).toBe('bold');
  });

  it('appends children after html', () => {
    const child = document.createElement('span');
    const card = em.Card({ html: '<b>bold</b>', children: [child] });
    expect(inner(card).lastElementChild).toBe(child);
  });

  it('renders children', () => {
    const child = document.createElement('span');
    const card = em.Card({ content: 'text', children: [child] });
    expect(inner(card).contains(child)).toBe(true);
  });

  it('defaults to empty props', () => {
    expect(inner(em.Empty()).textContent).toBe('');
  });

  it('calls ref once when the element is created', () => {
    const ref = vi.fn();
    const card = em.Card({ ref });
    card.setState({ content: 'again' });
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(inner(card));
  });
});

describe('attributes', () => {
  it('sets string and number attributes', () => {
    const input = em.Field({ tag: 'input', placeholder: 'name', maxlength: 5 });
    expect(inner(input).getAttribute('placeholder')).toBe('name');
    expect(inner(input).getAttribute('maxlength')).toBe('5');
  });

  it('sets boolean true as empty attribute and skips false, null and objects', () => {
    const input = em.Field({ tag: 'input', disabled: true, hidden: false, id: null, data: {} });
    expect(inner(input).getAttribute('disabled')).toBe('');
    expect(inner(input).hasAttribute('hidden')).toBe(false);
    expect(inner(input).hasAttribute('id')).toBe(false);
    expect(inner(input).hasAttribute('data')).toBe(false);
  });

  it('does not allow attribute value injection', () => {
    const card = em.Card({ title: '"><script>alert(1)</script>' });
    expect(inner(card).querySelector('script')).toBeNull();
    expect(inner(card).getAttribute('title')).toBe('"><script>alert(1)</script>');
  });

  it('removes stale attributes on update', () => {
    const card = em.Card({ title: 'a', lang: 'en' });
    card.setState({ title: undefined });
    expect(inner(card).hasAttribute('title')).toBe(false);
    expect(inner(card).getAttribute('lang')).toBe('en');
  });

  it('does not render reserved props or handlers as attributes', () => {
    const card = em.Card({ content: 'x', children: [], onclick: () => {} });
    expect(inner(card).getAttributeNames()).toEqual([]);
  });
});

describe('style', () => {
  it('applies camelCase styles as css properties', () => {
    const card = em.Card({ style: { backgroundColor: 'red', zIndex: 2 as unknown as string } });
    expect(inner(card).style.getPropertyValue('background-color')).toBe('red');
    expect(inner(card).style.getPropertyValue('z-index')).toBe('2');
  });

  it('ignores non-primitive style values', () => {
    const card = em.Card({ style: { color: undefined, margin: {} as unknown as string } });
    expect(inner(card).getAttribute('style') ?? '').toBe('');
  });

  it('removes stale style properties on update', () => {
    const card = em.Card({ style: { color: 'red', padding: '1px' } });
    card.setState({ style: { color: 'blue' } });
    expect(inner(card).style.getPropertyValue('color')).toBe('blue');
    expect(inner(card).style.getPropertyValue('padding')).toBe('');
  });

  it('does not allow css to break out of the element', () => {
    const card = em.Card({ style: { color: 'red;} </style><script>alert(1)</script>' } });
    expect(inner(card).querySelector('script')).toBeNull();
    expect(card.shadowRoot!.querySelector('script')).toBeNull();
  });

  it('works without a style prop', () => {
    expect(inner(em.Card({ content: 'x' })).hasAttribute('style')).toBe(false);
  });
});

describe('events', () => {
  it('attaches handlers with lowercased event names', () => {
    const onclick = vi.fn();
    const card = em.Card({ onclick });
    inner(card).click();
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('ignores non-function handlers', () => {
    const card = em.Card({ onclick: 'alert(1)' as unknown as () => void });
    expect(() => inner(card).click()).not.toThrow();
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

  it('removes handlers when dropped from props', () => {
    const onclick = vi.fn();
    const card = em.Card({ onclick });
    card.setState({ onclick: undefined });
    inner(card).click();
    expect(onclick).not.toHaveBeenCalled();
  });
});

describe('state', () => {
  it('merges new props into existing ones', () => {
    const card = em.Card({ content: 'a', title: 't' });
    card.setState({ content: 'b' });
    expect(card.props).toMatchObject({ content: 'b', title: 't' });
    expect(inner(card).textContent).toBe('b');
  });

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
    const card = em.Card({ tag: 'div', onclick: vi.fn(), title: 'a', style: { color: 'red' } });
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
    card.remove();
  });

  it('renders on connect when props were never set', () => {
    const element = document.createElement('em-card') as Component;
    document.body.append(element);
    expect(inner(element).localName).toBe('div');
    element.remove();
  });
});
