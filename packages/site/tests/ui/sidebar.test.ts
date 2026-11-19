import { afterEach, describe, expect, it, vi } from 'vitest';
import { docs, groups } from '@site/content/docs/index';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';
import { Sidebar } from '@site/ui/sidebar';

afterEach(() => {
  vi.unstubAllGlobals();
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

/**
 * Replaces matchMedia with one whose answer the test controls.
 *
 * @param matches - Whether the screen is narrow.
 * @returns A function that changes the answer and tells the listeners.
 */
const stubWidth = (matches: boolean) => {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => query);
  return {
    listeners,
    set: (value: boolean) => {
      query.matches = value;
      [...listeners].forEach((listener) => listener());
    },
  };
};

describe('Sidebar on a narrow screen', () => {
  it('folds the topics into a closed details that names the current page', () => {
    stubWidth(true);
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const topics = sidebar.querySelector('details')!;
    expect(topics.open).toBe(false);
    expect(topics.querySelector('summary')?.textContent).toBe('Topics: Routing');
    expect(sidebar.firstElementChild).toBe(topics);
  });

  it('is open on a wide screen, and follows the width when it changes', () => {
    const width = stubWidth(false);
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    const topics = sidebar.querySelector('details')!;
    expect(topics.open).toBe(true);
    width.set(true);
    expect(topics.open).toBe(false);
    width.set(false);
    expect(topics.open).toBe(true);
  });

  it('stops following the width once the navigation has left the page', () => {
    const width = stubWidth(false);
    const sidebar = Sidebar(makeRouter('/docs/routing'));
    document.body.append(sidebar);
    sidebar.remove();
    width.set(true);
    expect(width.listeners.size).toBe(0);
  });

  it('names no page for an address that is not a topic', () => {
    stubWidth(true);
    const sidebar = Sidebar(makeRouter('/docs/nope'));
    expect(sidebar.querySelector('summary')?.textContent).toBe('Topics');
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
    expect(sidebar.querySelector('summary')?.textContent).toBe('Темы: Роутинг');
    await resetLocale();
  });
});
