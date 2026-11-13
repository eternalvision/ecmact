import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/comparison';
import { validatePage } from '@tests/content/validate';

describe('docs: comparison', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'comparison')).toEqual([]);
  });
});
