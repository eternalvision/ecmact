import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/routing';
import { validatePage } from '@tests/content/validate';

describe('docs: routing', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'routing')).toEqual([]);
  });
});
