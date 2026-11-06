import { describe, expect, expectTypeOf, it } from 'vitest';
import { em, type Component } from '@em';
import { createFactory, isIgnoredKey } from '@em/em';
import { inner } from '@tests/helpers';

describe('em', () => {
  it('registers a lowercase custom element once per name', () => {
    em.Widget();
    em.Widget();
    expect(customElements.get('em-widget')).toBeDefined();
  });

  it('shares the element between different casings', () => {
    expect(em.Foo()).toBeInstanceOf(customElements.get('em-foo')!);
    expect(em.FOO()).toBeInstanceOf(customElements.get('em-foo')!);
  });

  it('renders a div by default', () => {
    expect(inner(em.Card({ content: 'hello' })).localName).toBe('div');
  });

  it('renders the given tag', () => {
    expect(inner(em.Heading({ tag: 'h1' })).localName).toBe('h1');
  });

  it('works without props', () => {
    expect(inner(em.Empty()).textContent).toBe('');
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
    expect(() => em['1abc']).toThrow('invalid component name');
  });

  it('defaults to div and infers the tag from props', () => {
    expectTypeOf(em.Card()).toEqualTypeOf<Component<'div'>>();
    expectTypeOf(em.Link({ tag: 'a', href: '/' })).toEqualTypeOf<Component<'a'>>();
    expectTypeOf(em.Field({ tag: 'input', type: 'email' })).toEqualTypeOf<Component<'input'>>();
  });
});

describe('createFactory', () => {
  it('registers the element and returns a factory', () => {
    const factory = createFactory('Direct');
    expect(customElements.get('em-direct')).toBeDefined();
    expect(inner(factory({ content: 'x' })).textContent).toBe('x');
  });

  it('creates elements without props', () => {
    expect(inner(createFactory('Direct')()).localName).toBe('div');
  });

  it('rejects invalid names', () => {
    expect(() => createFactory('not valid')).toThrow('invalid component name "not valid"');
  });
});

describe('isIgnoredKey', () => {
  it('ignores symbols and then', () => {
    expect(isIgnoredKey(Symbol('x'))).toBe(true);
    expect(isIgnoredKey('then')).toBe(true);
  });

  it('accepts ordinary names', () => {
    expect(isIgnoredKey('Card')).toBe(false);
  });
});
