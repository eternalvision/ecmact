import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  computed,
  em,
  signal,
  tags,
  type Child,
  type Component,
  type ComponentProps,
  type Props,
} from '@em';

describe('Props', () => {
  it('types event handlers by event name', () => {
    tags.div({
      onclick: (event) => expectTypeOf(event).toEqualTypeOf<HTMLElementEventMap['click']>(),
    });
    tags.input({
      onkeydown: (event) => expectTypeOf(event).toEqualTypeOf<KeyboardEvent>(),
      onwheel: { handler: (event) => expectTypeOf(event).toEqualTypeOf<WheelEvent>(), once: true },
      onfocus: false,
    });
    expect(true).toBe(true);
  });

  it('rejects unknown events on standard tags', () => {
    // @ts-expect-error misspelled event
    tags.div({ onclik: () => {} });
    expect(true).toBe(true);
  });

  it('types style values, which may be reactive', () => {
    tags.div({ style: { color: 'red', zIndex: 2, width: null } });
    tags.div({ style: { color: signal('red'), width: () => '1px' } });
    tags.div({ style: () => ({ color: 'red' }) });
    tags.div({ style: computed(() => ({ color: 'red' })) });
    // @ts-expect-error boolean is not a css value
    tags.div({ style: { color: true } });
    // @ts-expect-error unknown css property
    tags.div({ style: { notAProperty: 'x' } });
    expect(true).toBe(true);
  });

  it('types ref by tag', () => {
    tags.input({ ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLInputElement>() });
    tags['x-thing']({ ref: (element) => expectTypeOf(element).toEqualTypeOf<HTMLElement>() });
    expect(true).toBe(true);
  });

  it('lets attributes be plain, switched off, a signal or a function', () => {
    const done = signal(false);
    tags.input({ type: 'text', disabled: done, maxlength: () => 5, placeholder: null });
    tags.li({ class: () => done.value && 'done', title: computed(() => 'x') });
    // @ts-expect-error a signal of the wrong type
    tags.input({ maxlength: signal('5') });
    // @ts-expect-error a function of the wrong type
    tags.input({ disabled: () => 'yes' });
    expect(true).toBe(true);
  });

  it('takes class as text, a list, an object of switches, or reactive', () => {
    const done = signal(false);
    tags.li({ class: 'a' });
    tags.li({ class: ['a', done.value && 'b', () => done.value && 'c', ['d']] });
    tags.li({ class: { a: true, b: done, c: () => done.value } });
    tags.li({ class: () => ['a', { b: done.value }] });
    // @ts-expect-error a number is not a class
    tags.li({ class: 5 });
    // @ts-expect-error a switch is a boolean
    tags.li({ class: { a: 'yes' } });
    expect(true).toBe(true);
  });

  it('takes numbers in style', () => {
    tags.div({ style: { width: 240, opacity: 0.5 } });
    tags.div({ style: { '--gap': 4, '--accent': () => 'red' } });
    tags.div({ style: () => ({ '--gap': '4px' }) });
    expect(true).toBe(true);
  });

  it('takes html, provide and error', () => {
    expectTypeOf<Props<'div'>>().toHaveProperty('html');
    expectTypeOf<Props<'div'>>().toHaveProperty('provide');
    expectTypeOf<Props<'div'>>().toHaveProperty('error');
    expect(true).toBe(true);
  });

  it('accepts anything on custom tags', () => {
    expectTypeOf<{ whatever: number }>().toExtend<Props>();
    expect(true).toBe(true);
  });
});

describe('Child', () => {
  it('accepts nodes, text, lists and reactive values', () => {
    expectTypeOf<Node>().toExtend<Child>();
    expectTypeOf<number>().toExtend<Child>();
    expectTypeOf<null>().toExtend<Child>();
    expectTypeOf<(string | Node)[]>().toExtend<Child>();
    expectTypeOf<() => string | false>().toExtend<Child>();
    expectTypeOf<() => Node[]>().toExtend<Child>();
    expectTypeOf(signal('a')).toExtend<Child>();
    expectTypeOf(computed(() => [tags.li()])).toExtend<Child>();
    expect(true).toBe(true);
  });

  it('rejects plain objects', () => {
    expectTypeOf<{ a: number }>().not.toExtend<Child>();
    expect(true).toBe(true);
  });
});

describe('ComponentProps', () => {
  it('types the hooks with the component', () => {
    em.Card({
      mounted: (host) => {
        expectTypeOf(host).toEqualTypeOf<Component>();
        return () => {};
      },
      unmounted: (host) => expectTypeOf(host).toEqualTypeOf<Component>(),
      ref: (host) => expectTypeOf(host).toEqualTypeOf<Component>(),
    });
    expect(true).toBe(true);
  });

  it('takes css, shadow, field and the global attributes', () => {
    em.Card({ css: 'a {}', shadow: false, field: true, name: 'n', disabled: true, class: 'x' });
    em.Card({ css: signal('a {}') });
    expectTypeOf<ComponentProps>().toHaveProperty('onclick');
    expect(true).toBe(true);
  });

  it('rejects the attributes of other tags and misspelled props', () => {
    // @ts-expect-error href is not a component prop
    em.Card({ href: '/' });
    // @ts-expect-error misspelled hook
    em.Card({ mountd: () => {} });
    expect(true).toBe(true);
  });
});
