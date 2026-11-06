import { describe, expect, it } from 'vitest';
import { checkTranslation } from '@tests/content/translation';

describe('docs in Russian: http', () => {
  it('has a translation for every string, nothing left in English and no broken links', () => {
    const { page, translated, problems } = checkTranslation('http');
    expect(problems).toEqual([]);
    expect(translated.blocks.map((block) => block.type)).toEqual(
      page.blocks.map((block) => block.type),
    );
  });
});
