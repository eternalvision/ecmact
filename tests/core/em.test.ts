import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { configure, em, type Component } from '@em';
import { resetConfig } from '@em/core/config';
import { createFactory, elementName } from '@em/core/em';

afterEach(() => {
  resetConfig();
});

describe('elementName', () => {
  it('joins the words of a name with hyphens', () => {
    expect(elementName('UserCard')).toBe('user-card');
    expect(elementName('userCard')).toBe('user-card');
    expect(elementName('Todo2App')).toBe('todo2-app');
    expect(elementName('price-widget')).toBe('price-widget');
  });

  it('adds the prefix to a name of one word', () => {
    expect(elementName('Card')).toBe('em-card');
    expect(elementName('CARD')).toBe('em-card');
    expect(elementName('card')).toBe('em-card');
  });

  it('uses the configured prefix', () => {
    configure({ prefix: 'my' });
    expect(elementName('Card')).toBe('my-card');
    expect(elementName('UserCard')).toBe('user-card');
  });

  it('requires two words when the prefix is empty', () => {
    configure({ prefix: '' });
    expect(elementName('UserCard')).toBe('user-card');
    expect(() => elementName('Card')).toThrow('component "Card" needs a name of two words');
  });

  it('rejects invalid names', () => {
    expect(() => elementName('bad name')).toThrow(TypeError);
    expect(() => elementName('1abc')).toThrow('invalid component name "1abc"');
  });
});

describe('em', () => {
  it('registers a custom element once per name', () => {
    em.Widget();
    em.Widget();
    expect(customElements.get('em-widget')).toBeDefined();
  });

  it('shares the element between different casings', () => {
    expect(em.Foo()).toBeInstanceOf(customElements.get('em-foo')!);
    expect(em.FOO()).toBeInstanceOf(customElements.get('em-foo')!);
  });

  it('names a component of two words without a prefix', () => {
    expect(em.ProfileCard().localName).toBe('profile-card');
  });

  it('puts the children into a shadow root', () => {
    const card = em.Card('hello');
    expect(card.shadowRoot!.textContent).toBe('hello');
    expect(card.childNodes).toHaveLength(0);
  });

  it('takes props first and children after them', () => {
    const card = em.Card({ class: 'big', shadow: false }, 'a', 'b');
    expect(card.className).toBe('big');
    expect(card.textContent).toBe('ab');
  });

  it('returns undefined for symbols and then', () => {
    expect(Reflect.get(em, Symbol.toPrimitive)).toBeUndefined();
    expect((em as Record<string, unknown>).then).toBeUndefined();
  });

  it('is safe to await', async () => {
    await expect(Promise.resolve(em)).resolves.toBe(em);
  });

  it('rejects invalid component names', () => {
    expect(() => em['bad name']).toThrow(TypeError);
  });

  it('returns a component', () => {
    expectTypeOf(em.Card()).toEqualTypeOf<Component>();
    expectTypeOf(em.Card({ css: 'a {}' }, 'x')).toEqualTypeOf<Component>();
  });
});

describe('createFactory', () => {
  it('registers the element and returns a factory', () => {
    const factory = createFactory('Direct');
    expect(customElements.get('em-direct')).toBeDefined();
    expect(factory('x').shadowRoot!.textContent).toBe('x');
  });
});
