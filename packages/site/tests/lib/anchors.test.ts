import { describe, expect, it } from 'vitest';
import { anchorIds, headingAliases } from '@site/lib/anchors';

describe('anchorIds', () => {
  it('slugifies the headings and numbers the repeated ones from 2', () => {
    expect(anchorIds(['First `thing`', 'Sub', 'First thing', 'first thing'])).toEqual([
      'first-thing',
      'sub',
      'first-thing-2',
      'first-thing-3',
    ]);
  });

  it('gives a heading without Latin letters the id of a section, numbered like the others', () => {
    expect(anchorIds(['???', 'Привет', 'API'])).toEqual(['section', 'section-2', 'api']);
  });

  it('is empty for no headings', () => {
    expect(anchorIds([])).toEqual([]);
  });
});

describe('headingAliases', () => {
  it('keeps the aliases that point to a free id, once', () => {
    expect(
      headingAliases(
        ['a', 'b'],
        [
          ['x', 'a', 'y'],
          ['x', 'y', 'b'],
        ],
      ),
    ).toEqual([['x', 'y'], []]);
  });

  it('gives a heading without aliases an empty list', () => {
    expect(headingAliases(['a', 'b'], [undefined, ['c']])).toEqual([[], ['c']]);
  });
});
