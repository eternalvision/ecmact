import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  AttributeMap,
  ComponentProps,
  GlobalAttributes,
  RenderState,
  TagName,
} from '@em/types';

describe('types', () => {
  it('re-exports the public types', () => {
    expectTypeOf<TagName>().toExtend<string>();
    expectTypeOf<ComponentProps<'a'>>().toHaveProperty('href');
    expectTypeOf<GlobalAttributes>().toHaveProperty('id');
    expectTypeOf<keyof AttributeMap>().toExtend<string>();
    expectTypeOf<RenderState>().toHaveProperty('element');
    expect(true).toBe(true);
  });
});
