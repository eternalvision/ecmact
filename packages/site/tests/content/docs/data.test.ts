import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/data';
import { validatePage } from '@tests/content/validate';

describe('docs: data', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'data')).toEqual([]);
  });
});
