import { describe, expect, it } from 'vitest';
import { page } from '@site/content/docs/styled';
import { validatePage } from '@tests/content/validate';

describe('docs: styled', () => {
  it('is a valid page with working demos, links and tables', () => {
    expect(validatePage(page, 'styled')).toEqual([]);
  });
});
