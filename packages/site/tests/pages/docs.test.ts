import { mount } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { docs, docsFor, findDoc } from '@site/content/docs/index';
import { docsPage } from '@site/pages/docs';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';
import { baseline } from '@tests/pages/docAnchors';

afterEach(() => {
  vi.useRealTimers();
  disposeRouters();
  document.body.replaceChildren();
});

const open = (slug: string) => {
  const router = makeRouter(`/docs/${slug}`);
  const page = docsPage(router, findDoc(slug)!);
  mount(document.body, page);
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

  it('is the main region, with skip links that lead into the article and to its sections', () => {
    const { page } = open('routing');
    expect(page.localName).toBe('main');
    const links = [...page.querySelectorAll<HTMLAnchorElement>('.skip-link')];
    expect(links.map((link) => link.textContent)).toEqual([
      'Skip to the article',
      'Skip to the sections of this page',
    ]);
    const [article, sections] = links.map((link) =>
      page.querySelector(link.getAttribute('href') as string),
    );
    expect(article).toBe(page.querySelector('article h1'));
    expect(sections).toBe(page.querySelector('.toc-title'));
    expect(page.firstElementChild?.className).toBe('skip-links');
  });

  it('hands the focus to the article after a topic or the next page opens', async () => {
    const { page, router } = open('routing');
    page.querySelector<HTMLAnchorElement>('.sidebar a[href="/docs/forms"]')!.click();
    await vi.waitFor(() => expect(document.activeElement).toBe(page.querySelector('article h1')));
    expect(router.location.value.path).toBe('/docs/forms');
    (document.activeElement as HTMLElement).blur();
    page.querySelector<HTMLAnchorElement>('.pager-link.next')!.click();
    await vi.waitFor(() => expect(document.activeElement).toBe(page.querySelector('article h1')));
    expect(router.location.value.path).toBe('/docs/state');
  });

  it('leaves the focus alone for a click the router did not handle', async () => {
    vi.useFakeTimers();
    const { page } = open('getting-started');
    page
      .querySelector<HTMLAnchorElement>('.sidebar a[href="/docs/forms"]')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    page.querySelector('.sidebar-title')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    page.dispatchEvent(new MouseEvent('click'));
    vi.runAllTimers();
    expect(document.activeElement).toBe(document.body);
    vi.useRealTimers();
  });

  it('focuses the title after an in-article link opens another page, and goes to the top at once', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { page } = open('getting-started');
    page.querySelector<HTMLAnchorElement>('article a[data-internal="/docs/components"]')!.click();
    await vi.waitFor(() => expect(document.activeElement).toBe(page.querySelector('article h1')));
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    scroll.mockRestore();
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
    mount(document.body, page);
    expect(page.querySelector('.toc')).toBeNull();
    expect([...page.querySelectorAll('.skip-link')].map((link) => link.textContent)).toEqual([
      'Skip to the article',
    ]);
  });
});

describe('docsPage in Russian', () => {
  it('shows the page, the group and the links in Russian', async () => {
    await useLocale('ru');
    const router = makeRouter('/docs/routing');
    const page = docsPage(router, findDoc('routing', 'ru')!);
    mount(document.body, page);
    expect(page.querySelector('article h1')?.textContent).toBe('Роутинг');
    expect(page.querySelector('.eyebrow')?.textContent).toBe('Приложение');
    expect([...page.querySelectorAll('.pager a')].map((a) => a.textContent)).toEqual([
      '← Формы',
      'Управление состоянием →',
    ]);
    expect(page.querySelector('.edit a')?.textContent).toBe('Править эту страницу на GitHub');
    expect(page.querySelector('.toc .toc-title')?.textContent).toBe('На этой странице');
    expect([...page.querySelectorAll('.skip-link')].map((link) => link.textContent)).toEqual([
      'Перейти к статье',
      'Перейти к разделам страницы',
    ]);
    await resetLocale();
  });
});

const locales = ['en', 'ru'] as const;

describe.each(locales)('the addresses of the pages in %s', (locale) => {
  const slugs = Object.keys(baseline[locale]);

  afterEach(async () => {
    await resetLocale();
  });

  it('are the 19 pages of the baseline, in the order of the guide', () => {
    expect(docsFor(locale).map((page) => page.slug)).toEqual(slugs);
    expect(slugs).toHaveLength(19);
  });

  it.each(slugs)('%s keeps its heading ids, its demos and its sidebar link', async (slug) => {
    await useLocale(locale);
    const router = makeRouter(`/docs/${slug}`);
    const page = docsPage(router, findDoc(slug, locale)!);
    mount(document.body, page);
    const expected = baseline[locale][slug]!;
    const ids = [...page.querySelectorAll('article > h2, article > h3')].map(
      (heading) => heading.id,
    );
    expect(ids).toEqual(expected.ids);
    expect(
      [...page.querySelectorAll('.toc a')].map((link) => link.getAttribute('href')?.slice(1)),
    ).toEqual(ids.length > 1 ? ids : []);
    ids.forEach((id) => expect(page.querySelector(`#${id}`)?.localName).toMatch(/^h[23]$/));
    expect(
      [...page.querySelectorAll('article .demo .code-title')].map((title) =>
        title.textContent?.replace(/\.ts$/, ''),
      ),
    ).toEqual(expected.demos);
    expect(page.querySelector('.sidebar a[aria-current="page"]')?.getAttribute('href')).toBe(
      `/docs/${slug}`,
    );
  });
});

describe('the addresses of the English headings in Russian', () => {
  afterEach(async () => {
    await resetLocale();
  });

  it.each(Object.keys(baseline.en))('%s answers to every English id', async (slug) => {
    await useLocale('ru');
    const router = makeRouter(`/docs/${slug}`);
    const page = docsPage(router, findDoc(slug, 'ru')!);
    mount(document.body, page);
    baseline.en[slug]!.ids.forEach((id) => {
      expect(page.querySelector(`#${id}`), `${slug}#${id}`).not.toBeNull();
    });
  });

  it('lands an English id on the same section, also for a repeated heading', async () => {
    await useLocale('ru');
    const page = docsPage(makeRouter('/docs/components'), findDoc('components', 'ru')!);
    mount(document.body, page);
    const russian = [...page.querySelectorAll('article > h2, article > h3')];
    baseline.en.components!.ids.forEach((id, index) => {
      expect(page.querySelector(`#${id}`)?.closest('h2, h3')).toBe(russian[index]);
    });
  });
});

describe('the addresses of the Russian headings in English', () => {
  it.each(Object.keys(baseline.ru))('%s answers to every Russian id', (slug) => {
    const page = docsPage(makeRouter(`/docs/${slug}`), findDoc(slug)!);
    mount(document.body, page);
    baseline.ru[slug]!.ids.forEach((id) => {
      expect(page.querySelector(`#${id}`), `${slug}#${id}`).not.toBeNull();
    });
  });

  it('lands #section-2 on the second section of the English page', () => {
    const page = docsPage(makeRouter('/docs/getting-started'), findDoc('getting-started')!);
    mount(document.body, page);
    const english = [...page.querySelectorAll('article > h2')];
    expect(page.querySelector('#section-2')?.closest('h2')).toBe(english[1]);
  });
});
