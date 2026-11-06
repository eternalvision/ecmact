import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/components';
import { validatePage } from '@tests/content/validate';

describe('docs: components', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'components')).toEqual([]);
  });
});
