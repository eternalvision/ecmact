import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/signals';
import { validatePage } from '@tests/content/validate';

describe('docs: signals', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'signals')).toEqual([]);
  });
});
