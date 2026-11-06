import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/security';
import { validatePage } from '@tests/content/validate';

describe('docs: security', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'security')).toEqual([]);
  });
});
