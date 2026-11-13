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
    expect([...sidebar.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(groups);
    expect(sidebar.querySelectorAll('.sidebar-group > a')).toHaveLength(docs.length);
    expect(sidebar.localName).toBe('nav');
  });

  it('marks the page that is open', () => {
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const current = sidebar.querySelector('a[aria-current="page"]');
    expect(current?.textContent).toBe('Routing');
  });
});

describe('Sidebar in Russian', () => {
  it('has the groups and the pages in Russian', async () => {
    await useLocale('ru');
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    expect([...sidebar.querySelectorAll('h2')].map((h) => h.textContent)).toEqual([
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
