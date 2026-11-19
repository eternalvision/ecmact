import { mount } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { features, useCases } from '@site/content/features';
import { entryName, markup, markupName, source } from '@site/demos/estimate';
import { home } from '@site/pages/home';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
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
    expect(actions).toEqual(['Get started', 'Build a widget', 'See live examples', 'GitHub']);
    expect(page.querySelectorAll('.badges a')).toHaveLength(4);
  });

  it('sends a visitor to the app guide and to the widget guide', () => {
    const { page, router } = build();
    const [app, widget] = [...page.querySelectorAll<HTMLAnchorElement>('.hero .actions a')];
    widget!.click();
    expect(router.location.value.path).toBe('/docs/widgets');
    app!.click();
    expect(router.location.value.path).toBe('/docs/getting-started');
  });

  it('puts a runnable example on the first screen, in reading order after the install command', () => {
    const { page } = build();
    const hero = page.querySelector('.hero')!;
    const example = hero.querySelector('.try')!;
    expect(example.getAttribute('aria-label')).toBe('A runnable ECMact example');
    const install = hero.querySelector('.install')!;
    expect(
      install.compareDocumentPosition(example) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const [entry, result] = [
      example.querySelector('.try-body > .code')!,
      example.querySelector('.try-body > .try-result')!,
    ];
    expect(entry.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(entry.querySelector('.code-title')?.textContent).toBe(entryName);
    expect(entry.querySelector('pre')?.textContent).toBe(source);
    const markupBlock = example.querySelector('.try > .code')!;
    expect(markupBlock.querySelector('.code-title')?.textContent).toBe(markupName);
    expect(markupBlock.querySelector('pre')?.textContent).toBe(markup);
  });

  it('labels the example result as sample data and updates it from the keyboard-operable button', () => {
    const { page } = build();
    const result = page.querySelector('.try-result')!;
    expect(result.querySelector('.try-sample')?.textContent).toContain('Sample data');
    const button = result.querySelector('button')!;
    const output = result.querySelector('output')!;
    expect(button.type).toBe('button');
    expect(button.tabIndex).toBe(0);
    expect(output.textContent).toBe('$49');
    button.click();
    expect(output.textContent).toBe('$98');
  });

  it('copies the install command and the example text without prompts or line labels', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { page } = build();
    page.querySelector<HTMLButtonElement>('.hero .install .code-copy')!.click();
    page.querySelector<HTMLButtonElement>('.try-body .code-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenNthCalledWith(1, 'npm create ecmact@latest my-app');
    expect(writeText).toHaveBeenNthCalledWith(2, source);
  });

  it('says so on the copy button when the clipboard is denied', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = vi.fn(() => false);
    const { page } = build();
    const copy = page.querySelector<HTMLButtonElement>('.try-body .code-copy')!;
    copy.click();
    await vi.waitFor(() => expect(copy.textContent).toBe('Failed'));
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
    expect(page.querySelector('.try-sample')?.textContent).toContain('Пример данных');
    expect(page.querySelector('.try-label')?.textContent).toBe('Результат');
    expect(page.querySelector('.hero .actions a:nth-child(2)')?.textContent).toBe('Собрать виджет');
    expect(page.querySelector('.split h2')?.textContent).toBe('Создан для встраивания');
    expect(page.querySelector('.use h3')?.textContent).toBe('Виджеты для чужих сайтов');
    expect(page.querySelector('.demo h3')?.textContent).toBe('Сигналы');
    await resetLocale();
  });
});
