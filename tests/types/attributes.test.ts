import { describe, expect, expectTypeOf, it } from 'vitest';
import { tags } from '@em';
import type { AttributeMap, GlobalAttributes } from '@em/types';

describe('AttributeMap', () => {
  it('only describes standard tags', () => {
    expectTypeOf<keyof AttributeMap>().toExtend<keyof HTMLElementTagNameMap>();
  });

  it('accepts the attributes of a tag', () => {
    tags.a({ href: '/', target: '_blank', rel: 'noopener', download: true });
    tags.img({ src: 'a.png', alt: '', loading: 'lazy', width: 10 });
    tags.area({ shape: 'rect', coords: '0,0,1,1', href: '/' });
    tags.embed({ src: 'a.pdf', type: 'application/pdf' });
    tags.button({ popovertarget: 'menu', popovertargetaction: 'toggle' });
    expect(true).toBe(true);
  });

  it('rejects the attributes of other tags', () => {
    // @ts-expect-error src is not an anchor attribute
    tags.a({ src: 'a.png' });
    // @ts-expect-error href is not an input attribute
    tags.input({ href: '/' });
    // @ts-expect-error href is not a div attribute
    tags.div({ href: '/' });
    // @ts-expect-error alt is not a base attribute
    tags.base({ alt: 'x' });
    expect(true).toBe(true);
  });

  it('rejects invalid values', () => {
    // @ts-expect-error unknown input type
    tags.input({ type: 'bogus' });
    // @ts-expect-error maxlength is a number
    tags.input({ maxlength: '5' });
    expect(true).toBe(true);
  });

  it('allows any attribute for custom tags only', () => {
    tags['x-widget']({ foo: 'bar', onfoo: () => {} });
    // @ts-expect-error unknown attribute on a standard tag
    tags.section({ foo: 1 });
    expect(true).toBe(true);
  });
});

describe('GlobalAttributes', () => {
  it('applies to every tag', () => {
    tags.div({ id: 'x', class: 'y', hidden: true, popover: 'auto', autofocus: true });
    tags.div({ 'data-id': 1, 'aria-label': 'z', enterkeyhint: 'go' });
    expectTypeOf<GlobalAttributes['dir']>().toEqualTypeOf<'ltr' | 'rtl' | 'auto' | undefined>();
    expect(true).toBe(true);
  });
});
