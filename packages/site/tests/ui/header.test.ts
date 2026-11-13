import { afterEach, describe, expect, it } from 'vitest';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';
import { external, Header, outside } from '@site/ui/header';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('outside', () => {
  it('makes a link to another site that opens in a new tab', () => {
    const anchor = outside('https://x.test', 'X', 'btn');
    expect(anchor.getAttribute('href')).toBe('https://x.test');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noreferrer');
    expect(anchor.className).toBe('btn');
  });

  it('works without a class', () => {
    expect(outside('https://x.test', 'X').className).toBe('');
  });
});

describe('external', () => {
  it('points at the repository, npm, the widget demo and the starter', () => {
    expect(external.github).toBe('https://github.com/eternalvision/ecmact');
    expect(external.npm).toBe('https://www.npmjs.com/package/ecmact');
    expect(external.widget).toContain('/widget/');
    expect(external.starter).toContain('/starter/');
  });
});

describe('Header', () => {
  it('has the logo, the navigation and the theme toggle', () => {
    const header = Header(makeRouter('/'));
    document.body.append(header);
    expect(header.localName).toBe('header');
    expect(header.querySelector('.bar > a.logo')).not.toBeNull();
    expect(header.querySelector('.bar > nav.nav > a')?.getAttribute('href')).toBe('/docs');
    const labels = [...header.querySelectorAll('.nav a')].map((a) => a.textContent);
    expect(labels).toEqual(['Docs', 'Examples', 'Widgets', 'Starter', 'GitHub', 'npm']);
    expect(header.querySelector('.nav .chip')).not.toBeNull();
  });

  it('opens and closes the menu on a narrow screen', () => {
    const header = Header(makeRouter('/'));
    document.body.append(header);
    const menu = header.querySelector<HTMLButtonElement>('.menu')!;
    const nav = header.querySelector<HTMLElement>('#site-nav')!;
    expect(nav.dataset.open).toBe('false');
    expect(menu.textContent).toBe('Menu');
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    menu.click();
    expect(nav.dataset.open).toBe('true');
    expect(menu.textContent).toBe('Close');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    nav.click();
    expect(nav.dataset.open).toBe('false');
  });
});

describe('Header in Russian', () => {
  it('has the navigation and the language switch in Russian', async () => {
    await useLocale('ru');
    const header = Header(makeRouter('/'));
    document.body.append(header);
    const labels = [...header.querySelectorAll('.nav a')].map((a) => a.textContent);
    expect(labels.slice(0, 4)).toEqual(['Документация', 'Примеры', 'Виджеты', 'Стартер']);
    expect(header.querySelector('.menu')?.textContent).toBe('Меню');
    expect([...header.querySelectorAll('.nav .chip')].map((chip) => chip.textContent)).toEqual([
      'EN',
      '◐ Авто',
    ]);
    await resetLocale();
  });
});
