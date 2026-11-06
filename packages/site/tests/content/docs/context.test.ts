import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/context';
import { validatePage } from '@tests/content/validate';

describe('docs: context', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'context')).toEqual([]);
  });
});
