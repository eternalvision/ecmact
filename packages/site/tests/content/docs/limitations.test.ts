import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/limitations';
import { validatePage } from '@tests/content/validate';

describe('docs: limitations', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'limitations')).toEqual([]);
  });
});
