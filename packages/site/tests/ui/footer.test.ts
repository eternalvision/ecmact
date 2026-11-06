import { afterEach, describe, expect, it } from 'vitest';
import { disposeRouters, makeRouter } from '@tests/helpers';
import { Footer } from '@site/ui/footer';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('Footer', () => {
  it('links to the guide, the building blocks and the project', () => {
    const footer = Footer(makeRouter('/'));
    document.body.append(footer);
    const titles = [...footer.querySelectorAll('strong')].map((s) => s.textContent);
    expect(titles).toEqual(['ECMact', 'Learn', 'Build', 'Project']);
    const hrefs = [...footer.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('https://github.com/eternalvision/ecmact/tree/main/packages/site');
    expect(hrefs).toContain('https://www.npmjs.com/package/ecmact');
    expect(hrefs.some((href) => href?.endsWith('/docs/routing'))).toBe(true);
  });
});
