import { describe, expectTypeOf, it } from 'vitest';
import type { Block, DocGroup, DocPage } from '@site/content/types';

describe('content types', () => {
  it('describe a page as a group, a title and blocks', () => {
    expectTypeOf<DocPage['group']>().toEqualTypeOf<DocGroup>();
    expectTypeOf<DocPage['blocks']>().toEqualTypeOf<Block[]>();
    expectTypeOf<DocGroup>().toEqualTypeOf<
      'Start' | 'Core' | 'Application' | 'Delivery' | 'Reference'
    >();
  });

  it('tell blocks apart by their type', () => {
    expectTypeOf<Block['type']>().toEqualTypeOf<
      'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'code' | 'demo' | 'callout' | 'table'
    >();
  });
});
