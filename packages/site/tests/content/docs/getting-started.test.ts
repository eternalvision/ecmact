import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/getting-started';
import { validatePage } from '@tests/content/validate';

describe('docs: getting-started', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'getting-started')).toEqual([]);
  });
});
