import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/styling';
import { validatePage } from '@tests/content/validate';

describe('docs: styling', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'styling')).toEqual([]);
  });
});
