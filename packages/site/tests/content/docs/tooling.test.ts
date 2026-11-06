import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/tooling';
import { validatePage } from '@tests/content/validate';

describe('docs: tooling', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'tooling')).toEqual([]);
  });
});
