import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { signal, tags } from '@em';

describe('tags', () => {
  it('creates the plain element of the tag', () => {
    const button = tags.button('go');
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.outerHTML).toBe('<button>go</button>');
  });

  it('works without arguments', () => {
    expect(tags.section().outerHTML).toBe('<section></section>');
  });

  it('takes props first and children after them', () => {
    const onclick = vi.fn();
    const child = tags.span('child');
    const button = tags.button({ onclick, style: { color: 'red' } }, 'x', child);
    button.click();
    expect(onclick).toHaveBeenCalledTimes(1);
    expect(button.style.color).toBe('red');
    expect(button.lastChild).toBe(child);
  });

  it('can be destructured', () => {
    const { ul, li } = tags;
    expect(ul(li('one'), li('two')).outerHTML).toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it('renders functions and signals reactively', () => {
    const count = signal(0);
    const button = tags.button(
      { disabled: () => count.value > 1 },
      () => `count is ${count.value}`,
    );
    expect(button.textContent).toBe('count is 0');
    count.value = 2;
    expect(button.textContent).toBe('count is 2');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('creates custom elements by name', () => {
    expect(tags['x-widget']({ any: 'thing' }).outerHTML).toBe('<x-widget any="thing"></x-widget>');
  });

  it('returns undefined for symbols and then', () => {
    expect(Reflect.get(tags, Symbol.toPrimitive)).toBeUndefined();
    expect((tags as unknown as Record<string, unknown>).then).toBeUndefined();
  });

  it('is safe to await', async () => {
    await expect(Promise.resolve(tags)).resolves.toBe(tags);
  });

  it('infers the element type from the tag', () => {
    expectTypeOf(tags.a({ href: '/' })).toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf(tags.input()).toEqualTypeOf<HTMLInputElement>();
    expectTypeOf(tags.div('text')).toEqualTypeOf<HTMLDivElement>();
    expectTypeOf(tags['x-widget']()).toEqualTypeOf<HTMLElement>();
  });

  it('types attributes, events and ref by tag', () => {
    tags.input({
      type: 'email',
      'data-id': 1,
      oninput: (event) => expectTypeOf(event).toEqualTypeOf<HTMLElementEventMap['input']>(),
      ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLInputElement>(),
    });
    // @ts-expect-error src is not an anchor attribute
    tags.a({ src: 'x' });
    // @ts-expect-error unknown input type
    tags.input({ type: 'bogus' });
    // @ts-expect-error misspelled event
    tags.div({ onclik: () => {} });
    // @ts-expect-error css belongs to components
    tags.div({ css: 'a {}' });
    expect(true).toBe(true);
  });
});
