import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/typescript';
import { validatePage } from '@tests/content/validate';

describe('docs: typescript', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'typescript')).toEqual([]);
  });
});
