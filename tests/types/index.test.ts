import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  AttributeMap,
  Child,
  ComponentProps,
  ElementOf,
  Factory,
  Getter,
  GlobalAttributes,
  Optional,
  Props,
  Reactive,
  SheetState,
  Styles,
  TagName,
} from '@em/types';

describe('types', () => {
  it('re-exports the public types', () => {
    expectTypeOf<TagName>().toExtend<string>();
    expectTypeOf<string>().toExtend<Child>();
    expectTypeOf<Props<'a'>>().toHaveProperty('href');
    expectTypeOf<ComponentProps>().toHaveProperty('css');
    expectTypeOf<ElementOf<'input'>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<Factory<{ id: string }, Element>>().toBeFunction();
    expectTypeOf<() => number>().toExtend<Getter<number>>();
    expectTypeOf<null>().toExtend<Optional<string>>();
    expectTypeOf<string>().toExtend<Reactive<string>>();
    expectTypeOf<Styles>().toHaveProperty('color');
    expectTypeOf<GlobalAttributes>().toHaveProperty('id');
    expectTypeOf<keyof AttributeMap>().toExtend<string>();
    expectTypeOf<SheetState>().toHaveProperty('ownSheet');
    expect(true).toBe(true);
  });
});
