import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/state';
import { validatePage } from '@tests/content/validate';

describe('docs: state', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'state')).toEqual([]);
  });
});
