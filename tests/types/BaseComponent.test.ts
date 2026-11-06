import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  computed,
  em,
  signal,
  tags,
  type Component,
  type ComponentProps,
  type ResolvedProps,
} from '../../src';

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
        expectTypeOf(next).toEqualTypeOf<ResolvedProps<'input'>>();
        expectTypeOf(current).toEqualTypeOf<ResolvedProps<'input'>>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
        return next.value !== current.value;
      },
      updated: (element, component, previous) => {
        expectTypeOf(element).toEqualTypeOf<HTMLInputElement>();
        expectTypeOf(component).toEqualTypeOf<Component<'input'>>();
        expectTypeOf(previous).toEqualTypeOf<ResolvedProps<'input'>>();
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

describe('reactive props', () => {
  it('accepts signals for content, html, css and style', () => {
    em.Card({
      content: signal('a'),
      html: computed(() => '<b></b>'),
      css: signal('div {}'),
      style: { color: signal('red'), zIndex: computed(() => 2) },
    });
    em.Card({ style: signal({ color: signal('red') }) });
    expect(true).toBe(true);
  });

  it('accepts signals for attributes with the attribute type', () => {
    tags.input({
      type: signal<'text' | 'email'>('text'),
      disabled: signal(true),
      maxlength: computed(() => 5),
      title: signal('t'),
      'data-id': signal(1),
    });
    expect(true).toBe(true);
  });

  it('rejects signals of the wrong type', () => {
    const invalid = () => {
      // @ts-expect-error content is a string
      em.Card({ content: signal(1) });
      // @ts-expect-error disabled is a boolean
      tags.input({ disabled: signal('yes') });
      // @ts-expect-error unknown input type
      tags.input({ type: signal('bogus') });
    };
    expect(invalid).toBeTypeOf('function');
  });

  it('does not make handlers or structure reactive', () => {
    const invalid = () => {
      // @ts-expect-error handlers are plain functions
      em.Card({ onclick: signal(() => {}) });
      // @ts-expect-error children are plain nodes
      em.Card({ children: signal([]) });
      // @ts-expect-error the tag is not reactive
      em.Card({ tag: signal('div') });
    };
    expect(invalid).toBeTypeOf('function');
  });

  it('keeps the raw props typed with signals', () => {
    const card = em.Card({ content: signal('a') });
    expectTypeOf(card.props.content).toExtend<unknown>();
  });
});
