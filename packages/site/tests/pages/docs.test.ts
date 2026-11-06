import { afterEach, describe, expect, it } from 'vitest';
import { docs, findDoc } from '@site/content/docs/index';
import { docsPage } from '@site/pages/docs';
import { disposeRouters, makeRouter } from '@tests/helpers';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

const open = (slug: string) => {
  const router = makeRouter(`/docs/${slug}`);
  const page = docsPage(router, findDoc(slug)!);
  document.body.append(page);
  return { page, router };
};

describe('docsPage', () => {
  it('shows the sidebar, the article and the table of contents', () => {
    const { page } = open('routing');
    expect(page.querySelector('.sidebar')).not.toBeNull();
    expect(page.querySelector('article h1')?.textContent).toBe('Routing');
    expect(page.querySelector('.eyebrow')?.textContent).toBe('Application');
    expect(page.querySelector('.lead')?.textContent).toContain('History API');
    expect(page.querySelector('.toc')).not.toBeNull();
  });

  it('links to the page before and after, and to the source', () => {
    const { page } = open('routing');
    const pager = [...page.querySelectorAll('.pager a')].map((a) => a.textContent);
    expect(pager).toEqual(['← Forms', 'State management →']);
    expect(page.querySelector('.edit a')?.getAttribute('href')).toContain('docs/routing.ts');
  });

  it('has only one link at the ends', () => {
    expect(open(docs[0]!.slug).page.querySelectorAll('.pager a')).toHaveLength(1);
    document.body.replaceChildren();
    expect(open(docs.at(-1)!.slug).page.querySelectorAll('.pager a')).toHaveLength(1);
  });

  it('follows links inside the article without a reload', async () => {
    const { page, router } = open('getting-started');
    const link = page.querySelector<HTMLAnchorElement>(
      'article a[data-internal="/docs/components"]',
    )!;
    link.click();
    expect(router.location.value.path).toBe('/docs/components');
  });

  it('leaves out the table of contents for a page with a single heading', () => {
    const router = makeRouter('/docs/x');
    const page = docsPage(router, {
      slug: 'x',
      title: 'X',
      summary: 's',
      group: 'Start',
      blocks: [],
    });
    document.body.append(page);
    expect(page.querySelector('.toc')).toBeNull();
  });
});
