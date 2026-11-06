import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { tags, type Component } from '@em';
import { inner } from '@tests/helpers';

describe('tags', () => {
  it('renders the named tag', () => {
    expect(inner(tags.button({ content: 'go' })).localName).toBe('button');
    expect(inner(tags.a({ href: '/x' })).getAttribute('href')).toBe('/x');
  });

  it('works without props', () => {
    expect(inner(tags.section()).localName).toBe('section');
  });

  it('applies props, events and children like em', () => {
    const onclick = vi.fn();
    const child = tags.span({ content: 'child' });
    const button = tags.button({
      content: 'x',
      onclick,
      style: { color: 'red' },
      children: [child],
    });
    inner(button).click();
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(inner(button).style.color).toBe('red');
    expect(inner(button).contains(child)).toBe(true);
  });

  it('keeps the tag when updating', () => {
    const input = tags.input({ type: 'text' });
    input.setState({ placeholder: 'name' });
    expect(inner(input).localName).toBe('input');
    expect(inner(input).getAttribute('placeholder')).toBe('name');
  });

  it('returns undefined for symbols and then', () => {
    expect(Reflect.get(tags, Symbol.toPrimitive)).toBeUndefined();
    expect((tags as unknown as Record<string, unknown>).then).toBeUndefined();
  });

  it('rejects invalid names', () => {
    expect(() => (tags as unknown as Record<string, unknown>)['bad name']).toThrow(TypeError);
  });

  it('infers the component type from the tag', () => {
    expectTypeOf(tags.a({ href: '/' })).toEqualTypeOf<Component<'a'>>();
    expectTypeOf(tags.input()).toEqualTypeOf<Component<'input'>>();
  });

  it('types attributes, events and hooks by tag', () => {
    tags.input({
      type: 'email',
      'data-id': 1,
      oninput: (event) => expectTypeOf(event).toEqualTypeOf<HTMLElementEventMap['input']>(),
      ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLInputElement>(),
    });
    // @ts-expect-error src is not an anchor attribute
    tags.a({ src: 'x' });
    // @ts-expect-error tag is fixed by the factory
    tags.a({ tag: 'div' });
    // @ts-expect-error unknown input type
    tags.input({ type: 'bogus' });
    expect(true).toBe(true);
  });
});
