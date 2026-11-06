import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/api';
import { validatePage } from '@tests/content/validate';

describe('docs: api', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'api')).toEqual([]);
  });
});
