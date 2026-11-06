import { describe, expect, expectTypeOf, it } from 'vitest';
import { em, type AttributeMap, type Component, type ComponentProps } from '../src';

describe('tag inference', () => {
  it('defaults to div', () => {
    expectTypeOf(em.Card()).toEqualTypeOf<Component<'div'>>();
  });

  it('infers the tag from props', () => {
    expectTypeOf(em.Link({ tag: 'a', href: '/' })).toEqualTypeOf<Component<'a'>>();
    expectTypeOf(em.Field({ tag: 'input', type: 'email' })).toEqualTypeOf<Component<'input'>>();
  });

  it('types ref by tag', () => {
    em.Field({
      tag: 'input',
      ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLInputElement>(),
    });
    em.Custom({
      tag: 'x-widget',
      ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLElement>(),
    });
    expect(true).toBe(true);
  });
});

describe('attributes by tag', () => {
  it('accepts known attributes', () => {
    em.Link({ tag: 'a', href: '/', target: '_blank', rel: 'noopener', download: true });
    em.Picture({ tag: 'img', src: 'a.png', alt: '', loading: 'lazy', width: 10 });
    em.Card({ id: 'x', class: 'y', hidden: true, 'data-id': 1, 'aria-label': 'z' });
    expect(true).toBe(true);
  });

  it('rejects attributes of other tags', () => {
    // @ts-expect-error src is not an anchor attribute
    em.Link({ tag: 'a', src: 'a.png' });
    // @ts-expect-error href is not an input attribute
    em.Field({ tag: 'input', href: '/' });
    // @ts-expect-error href is not a div attribute
    em.Card({ href: '/' });
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
    expectTypeOf<{ foo: string }>().toExtend<ComponentProps>();
    expect(true).toBe(true);
  });
});

describe('events and styles', () => {
  it('types event handlers by event name', () => {
    em.Card({
      onclick: (event) => expectTypeOf(event).toEqualTypeOf<HTMLElementEventMap['click']>(),
    });
    em.Field({
      tag: 'input',
      onkeydown: (event) => expectTypeOf(event).toEqualTypeOf<KeyboardEvent>(),
    });
    expect(true).toBe(true);
  });

  it('rejects unknown events on known tags', () => {
    // @ts-expect-error misspelled event
    em.Card({ onclik: () => {} });
    expect(true).toBe(true);
  });

  it('types style values', () => {
    em.Card({ style: { color: 'red', zIndex: 2 } });
    // @ts-expect-error boolean is not a css value
    em.Card({ style: { color: true } });
    // @ts-expect-error unknown css property
    em.Card({ style: { notAProperty: 'x' } });
    expect(true).toBe(true);
  });
});

describe('lifecycle and shadow', () => {
  it('types hooks by tag', () => {
    em.Field({
      tag: 'input',
      shadow: false,
      mounted: (element, component) => {
        expectTypeOf(element).toEqualTypeOf<HTMLInputElement>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
        return () => {};
      },
      unmounted: (element, component) => {
        expectTypeOf(element).toEqualTypeOf<HTMLInputElement>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
      },
      beforeUpdate: (next, current, component) => {
        expectTypeOf(next).toEqualTypeOf<ComponentProps<'input'>>();
        expectTypeOf(current).toEqualTypeOf<ComponentProps<'input'>>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
        return next.value !== current.value;
      },
      updated: (element, component, previous) => {
        expectTypeOf(element).toEqualTypeOf<HTMLInputElement>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
        expectTypeOf(previous).toEqualTypeOf<ComponentProps<'input'>>();
      },
    });
    em.Card({
      mounted: (element) => {
        expectTypeOf(element).toEqualTypeOf<HTMLDivElement>();
      },
    });
    expect(true).toBe(true);
  });

  it('rejects invalid hook results', () => {
    // @ts-expect-error mounted may only return a cleanup function
    em.Card({ mounted: () => 'cleanup' });
    // @ts-expect-error beforeUpdate may only return a boolean
    em.Card({ beforeUpdate: () => 'no' });
    expect(true).toBe(true);
  });

  it('rejects an invalid shadow value', () => {
    // @ts-expect-error shadow is a boolean
    em.Card({ shadow: 'no' });
    expect(true).toBe(true);
  });
});

describe('attribute table', () => {
  it('only describes standard tags', () => {
    expectTypeOf<keyof AttributeMap>().toExtend<keyof HTMLElementTagNameMap>();
  });

  it('accepts newer attributes', () => {
    em.Pop({ popover: 'auto', autofocus: true, enterkeyhint: 'go' });
    em.Open({ tag: 'button', popovertarget: 'menu', popovertargetaction: 'toggle' });
    em.Area({ tag: 'area', shape: 'rect', coords: '0,0,1,1', href: '/' });
    em.Embed({ tag: 'embed', src: 'a.pdf', type: 'application/pdf' });
    // @ts-expect-error alt is not a base attribute
    em.Base({ tag: 'base', alt: 'x' });
    expect(true).toBe(true);
  });
});
