import { afterEach, describe, expect, it } from 'vitest';
import { docs, groups } from '@site/content/docs/index';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';
import { Sidebar } from '@site/ui/sidebar';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('Sidebar', () => {
  it('lists every page under its group', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    expect([...sidebar.querySelectorAll('.sidebar-title')].map((h) => h.textContent)).toEqual(
      groups,
    );
    expect(sidebar.querySelectorAll('.sidebar-group li > a')).toHaveLength(docs.length);
    expect(sidebar.querySelectorAll('.sidebar-group > ul')).toHaveLength(groups.length);
    expect(sidebar.localName).toBe('nav');
  });

  it('marks the page that is open', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const current = sidebar.querySelector('a[aria-current="page"]');
    expect(current?.textContent).toBe('Routing');
    expect(sidebar.querySelectorAll('a[aria-current="page"]')).toHaveLength(1);
  });

  it('links every page by its address', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const hrefs = [...sidebar.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(docs.map((page) => `/docs/${page.slug}`));
  });
});

describe('Sidebar in Russian', () => {
  it('has the groups and the pages in Russian', async () => {
    await useLocale('ru');
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    expect([...sidebar.querySelectorAll('.sidebar-title')].map((h) => h.textContent)).toEqual([
      'Начало',
      'Основы',
      'Приложение',
      'Поставка',
      'Справочник',
    ]);
    expect(sidebar.querySelector('a[aria-current="page"]')?.textContent).toBe('Роутинг');
    await resetLocale();
  });
});
