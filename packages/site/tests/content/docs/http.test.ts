import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/http';
import { validatePage } from '@tests/content/validate';

describe('docs: http', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'http')).toEqual([]);
  });
});
