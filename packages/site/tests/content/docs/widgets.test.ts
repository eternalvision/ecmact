import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/widgets';
import { validatePage } from '@tests/content/validate';

describe('docs: widgets', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'widgets')).toEqual([]);
  });
});
