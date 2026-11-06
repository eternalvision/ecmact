import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/lifecycle';
import { validatePage } from '@tests/content/validate';

describe('docs: lifecycle', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'lifecycle')).toEqual([]);
  });
});
