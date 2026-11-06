import { describe, expect, it } from 'vitest';
import { docs } from '@site/content/docs/index';
import { russian } from '@site/content/docs/ru/index';

describe('docs in Russian', () => {
  it('has a translation for every page and none for a page that does not exist', () => {
    expect(Object.keys(russian).sort()).toEqual(docs.map((page) => page.slug).sort());
  });
});
