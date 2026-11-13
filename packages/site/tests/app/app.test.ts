import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { start } from '@site/app/app';
import { currentLocale, localeStore } from '@site/lib/i18n';
import { resetLocale } from '@tests/helpers';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ecmact/');
});

afterEach(async () => {
  await resetLocale();
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

  it('takes the language from ?lang= in the address', () => {
    window.history.replaceState(null, '', '/ecmact/?lang=ru');
    const target = document.createElement('div');
    document.body.append(target);
    const { stop } = start(target);
    expect(currentLocale()).toBe('ru');
    expect(target.querySelector('.nav a')?.textContent).toBe('Документация');
    stop();
  });

  it('stops following the language', () => {
    const { target, stop } = open();
    stop();
    localeStore.cycle();
    expect(target.querySelector('.nav a')?.textContent).toBe('Docs');
  });
});
