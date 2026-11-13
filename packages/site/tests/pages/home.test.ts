import { mount } from 'ecmact';
import { afterEach, describe, expect, it } from 'vitest';
import { features, useCases } from '@site/content/features';
import { home } from '@site/pages/home';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('home', () => {
  const build = () => {
    const router = makeRouter('/');
    const page = home(router);
    mount(document.body, page);
    return { page, router };
  };

  it('has the hero with the promise, the install command and the calls to action', () => {
    const { page } = build();
    expect(page.querySelector('.hero h1')?.textContent).toContain('plain TypeScript');
    expect(page.querySelector('.install code')?.textContent).toContain('npm create ecmact@latest');
    const actions = [...page.querySelectorAll('.hero .actions a')].map((a) => a.textContent);
    expect(actions).toEqual(['Get started', 'See live examples', 'GitHub', 'npm']);
    expect(page.querySelectorAll('.badges a')).toHaveLength(4);
  });

  it('states the facts', () => {
    const { page } = build();
    expect(page.querySelectorAll('.fact')).toHaveLength(4);
  });

  it('has a card for every feature, each leading to its page', () => {
    const { page, router } = build();
    const cards = [...page.querySelectorAll<HTMLAnchorElement>('.card')];
    expect(cards).toHaveLength(features.length);
    expect(cards[0]!.localName).toBe('a');
    expect(cards[0]!.querySelector('.card-icon svg')).not.toBeNull();
    cards[0]!.click();
    expect(router.location.value.path).toBe(`/docs/${features[0]!.page}`);
  });

  it('runs two demos, embeds, shows a whole app and lists the use cases', () => {
    const { page } = build();
    expect(page.querySelectorAll('.demo')).toHaveLength(2);
    expect(page.querySelector('.split h2')?.textContent).toBe('Built to be embedded');
    expect(page.querySelectorAll('.use')).toHaveLength(useCases.length);
    expect(page.textContent).toContain('A whole app, one import');
    expect(page.querySelector('.closing .install')).not.toBeNull();
  });

  it('shows samples written for the current API', () => {
    const { page } = build();
    const samples = [...page.querySelectorAll('.split-code pre, .section > .code pre')].map(
      (pre) => pre.textContent,
    );
    expect(samples.some((sample) => sample.includes("api.resource('/products')"))).toBe(true);
    expect(samples.some((sample) => sample.includes('attributes: { price: 0 }'))).toBe(true);
    samples.forEach((sample) =>
      expect(sample).not.toMatch(/content:|\.getState\(\)|props\.price\.value/),
    );
  });
});

describe('home in Russian', () => {
  it('has the hero, the cards and the sections in Russian', async () => {
    await useLocale('ru');
    const page = home(makeRouter('/'));
    mount(document.body, page);
    expect(page.querySelector('.hero h1')?.textContent).toBe(
      'Виджеты для любого сайта на чистом TypeScript',
    );
    expect(page.querySelector('.card h3')?.textContent).toBe('Нативные Web Components');
    expect(page.querySelectorAll('.fact')).toHaveLength(4);
    expect(page.querySelector('.split h2')?.textContent).toBe('Создан для встраивания');
    expect(page.querySelector('.use h3')?.textContent).toBe('Виджеты для чужих сайтов');
    expect(page.querySelector('.demo h3')?.textContent).toBe('Сигналы');
    await resetLocale();
  });
});
