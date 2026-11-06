import { describe, expect, expectTypeOf, it } from 'vitest';
import { em } from '@em';
import type { AttributeMap, GlobalAttributes } from '@em/types';

describe('AttributeMap', () => {
  it('only describes standard tags', () => {
    expectTypeOf<keyof AttributeMap>().toExtend<keyof HTMLElementTagNameMap>();
  });

  it('accepts the attributes of a tag', () => {
    em.Link({ tag: 'a', href: '/', target: '_blank', rel: 'noopener', download: true });
    em.Picture({ tag: 'img', src: 'a.png', alt: '', loading: 'lazy', width: 10 });
    em.Area({ tag: 'area', shape: 'rect', coords: '0,0,1,1', href: '/' });
    em.Embed({ tag: 'embed', src: 'a.pdf', type: 'application/pdf' });
    em.Open({ tag: 'button', popovertarget: 'menu', popovertargetaction: 'toggle' });
    expect(true).toBe(true);
  });

  it('rejects the attributes of other tags', () => {
    // @ts-expect-error src is not an anchor attribute
    em.Link({ tag: 'a', src: 'a.png' });
    // @ts-expect-error href is not an input attribute
    em.Field({ tag: 'input', href: '/' });
    // @ts-expect-error href is not a div attribute
    em.Card({ href: '/' });
    // @ts-expect-error alt is not a base attribute
    em.Base({ tag: 'base', alt: 'x' });
    expect(true).toBe(true);
  });

  it('rejects invalid values', () => {
    // @ts-expect-error unknown input type
    em.Field({ tag: 'input', type: 'bogus' });
    // @ts-expect-error maxlength is a number
    em.Field({ tag: 'input', maxlength: '5' });
    // @ts-expect-error null is not a valid id
    em.Card({ id: null });
    expect(true).toBe(true);
  });

  it('allows any attribute for custom tags only', () => {
    em.Custom({ tag: 'x-widget', foo: 'bar', onfoo: () => {} });
    // @ts-expect-error unknown attribute on a standard tag
    em.Section({ tag: 'section', foo: 1 });
    expect(true).toBe(true);
  });
});

describe('GlobalAttributes', () => {
  it('applies to every tag', () => {
    em.Card({ id: 'x', class: 'y', hidden: true, popover: 'auto', autofocus: true });
    em.Card({ 'data-id': 1, 'aria-label': 'z', enterkeyhint: 'go' });
    expectTypeOf<GlobalAttributes['dir']>().toEqualTypeOf<'ltr' | 'rtl' | 'auto' | undefined>();
    expect(true).toBe(true);
  });
});
