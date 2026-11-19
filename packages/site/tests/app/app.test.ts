import * as library from 'ecmact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { start } from '@site/app/app';
import { currentLocale, localeStore } from '@site/lib/i18n';
import { resetLocale } from '@tests/helpers';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.doUnmock('ecmact');
  await resetLocale();
  // `resetLocale` resets the newest copy of the store; the one this file imported may be an older one.
  localeStore.setState({ locale: 'en' });
  localStorage.clear();
  vi.unstubAllEnvs();
  document.body.replaceChildren();
  delete document.documentElement.dataset.theme;
});

describe('start', () => {
  it('mounts the header, the page and the footer into the light DOM', () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(target.querySelector('header.site-header')).not.toBeNull();
    expect(target.querySelector('router-outlet.outlet > main.home .hero')).not.toBeNull();
    expect([...target.children].map((child) => child.localName)).toEqual([
      'header',
      'router-outlet',
      'footer',
    ]);
    expect(target.querySelector('footer.site-footer')).not.toBeNull();
    expect(document.title).toContain('ECMact');
    stop();
  });

  it('creates the status region once, outside the interface that is rebuilt', () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    const region = document.querySelector('.sr-status');
    expect(region).not.toBeNull();
    expect(target.contains(region)).toBe(false);
    stop();
  });

  it('keeps the title in step with the page', async () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    const { router, stop } = start(target);
    await router.navigate('/docs/routing');
    expect(document.title).toBe('Routing - ECMact docs');
    expect(target.querySelector('article h1')?.textContent).toBe('Routing');
    stop();
  });

  it('can be mounted by selector, and stops following the router', async () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    target.id = 'app';
    document.body.append(target);
    const { router, stop } = start('#app');
    stop();
    await router.navigate('/examples');
    expect(document.title).toContain('ECMact');
  });
});

/**
 * Loads the modules of the site again, as a reload of the page does, and starts the site at an address.
 *
 * @param address - The address of the page.
 * @returns The target and the function that stops the site.
 */
const reload = async (address: string) => {
  // The library stays the one copy: a second copy would meet the router-outlet element the first one defined.
  vi.resetModules();
  vi.doMock('ecmact', () => library);
  window.history.replaceState(null, '', address);
  const fresh = await import('@site/app/app');
  const target = document.createElement('div');
  document.body.append(target);
  return { target, stop: fresh.start(target).stop };
};

describe('start and the language', () => {
  const open = () => {
    window.history.replaceState(null, '', '/ecmact/');
    const target = document.createElement('div');
    document.body.append(target);
    return { target, ...start(target) };
  };

  it('builds the interface again in the other language when it changes', () => {
    const { target, stop } = open();
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
    expect(document.documentElement.lang).toBe('en');
    localeStore.cycle();
    expect(target.querySelector('.nav a')?.textContent).toBe('Документация');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toContain('Виджеты для любого сайта');
    expect(target.querySelectorAll('header.site-header')).toHaveLength(1);
    expect(target.querySelectorAll('footer.site-footer')).toHaveLength(1);
    stop();
  });

  it('keeps the page open while the language changes', async () => {
    const { target, router, stop } = open();
    await router.navigate('/docs/routing');
    localeStore.cycle();
    expect(target.querySelector('article h1')?.textContent).toBe('Роутинг');
    stop();
  });

  it('opens in English with a browser in Russian and nothing stored', () => {
    vi.stubGlobal('navigator', { language: 'ru-RU', languages: ['ru-RU'] });
    const { target, stop } = open();
    expect(document.documentElement.lang).toBe('en');
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
    stop();
  });

  it('keeps the choice of the control after a reload', async () => {
    const first = open();
    localeStore.cycle();
    first.stop();
    const { target, stop } = await reload('/ecmact/');
    expect(document.documentElement.lang).toBe('ru');
    expect(target.querySelector('.nav a')?.textContent).toBe('Документация');
    stop();
  });

  it('keeps the language of ?lang=ru for the tab session, not only for one page load', async () => {
    window.history.replaceState(null, '', '/ecmact/?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    start(target).stop();
    const next = await reload('/ecmact/docs/signals');
    expect(document.documentElement.lang).toBe('ru');
    expect(next.target.querySelector('article h1')?.textContent).toBe('Сигналы');
    expect(localStorage.getItem('ecmact-site-locale')).toBeNull();
    next.stop();
  });

  it('shows English for ?lang=en over a stored Russian choice, without changing the choice', () => {
    localeStore.cycle();
    window.history.replaceState(null, '', '/ecmact/?lang=en');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(currentLocale()).toBe('en');
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
    expect(JSON.parse(localStorage.getItem('ecmact-site-locale')!).state).toEqual({ locale: 'ru' });
    stop();
  });

  it('does not store the language of ?lang=ru, and the next visit without it is English', async () => {
    window.history.replaceState(null, '', '/ecmact/?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(currentLocale()).toBe('ru');
    expect(localStorage.getItem('ecmact-site-locale')).toBeNull();
    stop();
    localeStore.force('en');
    await localeStore.persist!.rehydrate();
    const next = open();
    expect(document.documentElement.lang).toBe('en');
    next.stop();
  });

  it('stores what the visitor sees when the control is used during a ?lang=ru visit', () => {
    window.history.replaceState(null, '', '/ecmact/?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    target.querySelector<HTMLButtonElement>('button.chip[aria-label^="Сменить язык"]')!.click();
    expect(currentLocale()).toBe('en');
    expect(JSON.parse(localStorage.getItem('ecmact-site-locale')!).state).toEqual({ locale: 'en' });
    stop();
  });

  it('ignores ?lang=de and an empty ?lang=', () => {
    for (const search of ['?lang=de', '?lang=']) {
      window.history.replaceState(null, '', `/ecmact/${search}`);
      const target = document.createElement('div');
      document.body.append(target);
      const { stop } = start(target);
      expect(currentLocale()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      stop();
    }
  });

  it('works for the visit when the storage throws on read and on write', async () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    vi.stubGlobal('localStorage', broken);
    vi.stubGlobal('sessionStorage', broken);
    const { target, stop } = await reload('/ecmact/');
    expect(document.documentElement.lang).toBe('en');
    target
      .querySelector<HTMLButtonElement>('button.chip[aria-label^="Switch the language"]')!
      .click();
    expect(document.documentElement.lang).toBe('ru');
    expect(target.querySelector('.nav a')?.textContent).toBe('Документация');
    stop();
  });

  it('ignores a stored language it does not know and still shows a working control', async () => {
    localStorage.setItem(
      'ecmact-site-locale',
      JSON.stringify({ state: { locale: 'de' }, version: 0 }),
    );
    const { target, stop } = await reload('/ecmact/');
    expect(document.documentElement.lang).toBe('en');
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
    expect(target.querySelector('button.chip[aria-label^="Switch the language"]')).not.toBeNull();
    stop();
  });

  it('takes the language from ?lang= in the address', () => {
    window.history.replaceState(null, '', '/ecmact/?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(currentLocale()).toBe('ru');
    expect(target.querySelector('.nav a')?.textContent).toBe('Документация');
    stop();
  });

  it('opens a documentation link in Russian with ?lang=ru and keeps the hash', () => {
    window.history.replaceState(null, '', '/ecmact/docs/signals?lang=ru#section-2');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(target.querySelector('article h1')?.textContent).toBe('Сигналы');
    expect(target.querySelector('#section-2')?.localName).toBe('h2');
    expect(target.querySelector('#rules')).not.toBeNull();
    expect(window.location.hash).toBe('#section-2');
    stop();
  });

  it('keeps ?lang=ru through the redirect of /docs', async () => {
    window.history.replaceState(null, '', '/ecmact/docs?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    const { router, stop } = start(target);
    await vi.waitFor(() => expect(router.location.value.path).toMatch(/^\/docs\/.+/));
    expect(window.location.search).toBe('?lang=ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(target.querySelector('article h1')?.textContent).toBe('Быстрый старт');
    stop();
  });

  it('stops following the language', () => {
    const { target, stop } = open();
    stop();
    localeStore.cycle();
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
  });
});
