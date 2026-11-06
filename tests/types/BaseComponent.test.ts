import { describe, expect, expectTypeOf, it } from 'vitest';
import { em, type Component, type ComponentProps } from '../../src';

describe('ComponentProps', () => {
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

  it('rejects unknown events on standard tags', () => {
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

  it('types css, html and content as strings', () => {
    em.Card({ css: 'div {}', html: '<b></b>', content: 'x' });
    const invalid = () =>
      // @ts-expect-error css is a string
      em.Card({ css: 1 });
    expect(invalid).toBeTypeOf('function');
    expect(true).toBe(true);
  });

  it('accepts any props for an unknown tag type', () => {
    expectTypeOf<{ foo: string }>().toExtend<ComponentProps>();
  });

  it('types the shadow option', () => {
    em.Card({ shadow: false });
    // @ts-expect-error shadow is a boolean
    em.Card({ shadow: 'no' });
    expect(true).toBe(true);
  });

  it('types the lifecycle hooks by tag', () => {
    em.Field({
      tag: 'input',
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
    expect(true).toBe(true);
  });

  it('rejects invalid hook results', () => {
    // @ts-expect-error mounted may only return a cleanup function
    em.Card({ mounted: () => 'cleanup' });
    // @ts-expect-error beforeUpdate may only return a boolean
    em.Card({ beforeUpdate: () => 'no' });
    expect(true).toBe(true);
  });
});
