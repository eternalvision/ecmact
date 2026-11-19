import { mount } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { features, useCases } from '@site/content/features';
import { entryName, markup, markupName, source } from '@site/demos/estimate';
import { home } from '@site/pages/home';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';

const execCommand = document.execCommand;

afterEach(() => {
  (document as { execCommand?: unknown }).execCommand = execCommand;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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

  it('has the hero with the promise, the entry points and the install command', () => {
    const { page } = build();
    expect(page.querySelector('.hero h1')?.textContent).toBe('Reactive UI on the DOM.');
    expect(page.querySelector('.hero .lead')?.textContent).toBe(
      'Build a page or embed a widget with typed elements, signals and Web Components.',
    );
    expect(page.querySelector('.hero.intro')).not.toBeNull();
    expect(page.querySelector('.install code')?.textContent).toContain('npm create ecmact@latest');
    const actions = [...page.querySelectorAll('.hero .actions a')];
    expect(actions.map((a) => a.textContent)).toEqual(['Get started', 'GitHub']);
    expect(actions[0]!.className).toBe('button');
    expect(actions[1]!.className).toBe('');
    expect(page.querySelectorAll('.badges a')).toHaveLength(4);
  });

  it('has the three steps under the hero, with plain links to the examples and the widget guide', () => {
    const { page, router } = build();
    const flow = page.querySelector('.flow')!;
    expect(flow.getAttribute('role')).toBe('group');
    expect(flow.getAttribute('aria-label')).toBe('How ECMact fits together');
    expect(flow.querySelector('p code')?.textContent).toBe('tags');
    expect([...flow.querySelectorAll('strong')].map((strong) => strong.textContent)).toEqual([
      'Build an element',
      'Give it state',
      'Embed the result',
    ]);
    expect(flow.querySelectorAll('a')).toHaveLength(2);
    expect(flow.querySelectorAll('.button')).toHaveLength(0);
    const [examples, widget] = [...flow.querySelectorAll<HTMLAnchorElement>('a')];
    widget!.click();
    expect(router.location.value.path).toBe('/docs/widgets');
    examples!.click();
    expect(router.location.value.path).toBe('/examples');
    expect(page.querySelector('.hero')!.nextElementSibling).toBe(flow);
    expect(flow.nextElementSibling?.className).toContain('starter');
  });

  it('sends a visitor to the app guide', () => {
    const { page, router } = build();
    page.querySelector<HTMLAnchorElement>('.hero .actions a')!.click();
    expect(router.location.value.path).toBe('/docs/getting-started');
  });

  it('puts a runnable example on the first screen, in reading order after the install command', () => {
    const { page } = build();
    const hero = page.querySelector('.hero')!;
    const example = hero.querySelector('.try')!;
    expect(example.getAttribute('aria-label')).toBe('A runnable ECMact example');
    const following = (first: Element, second: Element) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(following(hero.querySelector('.install')!, example)).toBe(true);
    expect(example.querySelectorAll('.code')).toHaveLength(1);
    const [entry, result] = [example.querySelector('.code')!, example.querySelector('.preview')!];
    expect(following(entry, result)).toBe(true);
    expect(entry.querySelector('.code-title')?.textContent).toBe(entryName);
    expect(entry.querySelector('pre')?.textContent).toBe(source);
  });

  it('shows how to run the example in a starter below the steps', () => {
    const { page } = build();
    const strip = page.querySelector('.starter')!;
    expect(page.querySelector('.flow')!.nextElementSibling).toBe(strip);
    expect(strip.querySelector('strong')?.textContent).toBe('Run it in a starter');
    expect(strip.querySelector('p')?.textContent).toContain('src/main.ts');
    expect(strip.querySelector('.code-title')?.textContent).toBe(markupName);
    expect(strip.querySelector('pre')?.textContent).toBe(markup);
    expect(page.querySelector('.hero')!.contains(strip)).toBe(false);
  });

  it('labels the example result as sample data and updates it from the button', () => {
    const { page } = build();
    const result = page.querySelector('.preview')!;
    expect(page.querySelector('.try-sample')?.textContent).toContain('Sample data');
    const button = result.querySelector('button')!;
    const output = result.querySelector('output')!;
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
    page.querySelector<HTMLButtonElement>('.try .code-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenNthCalledWith(1, 'npm create ecmact@latest my-app');
    expect(writeText).toHaveBeenNthCalledWith(2, source);
  });

  it('gives each copy button of the first screen its own name', () => {
    const { page } = build();
    const names = [...page.querySelectorAll('.hero .code-copy')].map((button) =>
      button.getAttribute('aria-label'),
    );
    expect(names).toEqual([
      'Copy to the clipboard: install command',
      'Copy to the clipboard: main.ts',
    ]);
  });

  it('says so on the copy button and to assistive technology when the clipboard is denied', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = vi.fn(() => false);
    const { page } = build();
    const copy = page.querySelector<HTMLButtonElement>('.try .code-copy')!;
    copy.click();
    await vi.waitFor(() => expect(copy.textContent).toBe('Failed'));
    await vi.waitFor(() =>
      expect(document.querySelector('.sr-status')?.textContent).toBe('Failed'),
    );
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
    expect(page.querySelector('.hero h1')?.textContent).toBe('Реактивный UI на DOM.');
    expect(page.querySelector('.try-sample')?.textContent).toBe(
      'Пример данных: условные $49 в час.',
    );
    expect(page.querySelector('.starter strong')?.textContent).toBe('Запустите в стартере');
    expect(page.querySelector('.flow p code')?.textContent).toBe('tags');
    expect(page.querySelector('.preview')?.getAttribute('aria-label')).toBe('Результат');
    expect(page.querySelector('.flow strong')?.textContent).toBe('Соберите элемент');
    expect(page.querySelector('.flow a')?.textContent).toBe('Живые примеры');
    expect(page.querySelector('.hero .code-copy')?.getAttribute('aria-label')).toBe(
      'Копировать в буфер обмена: команда установки',
    );
    expect(page.querySelector('.card h3')?.textContent).toBe('Нативные Web Components');
    expect(page.querySelectorAll('.fact')).toHaveLength(4);
    expect(page.querySelector('.try-sample')?.textContent).toContain('Пример данных');
    expect(page.querySelector('.split h2')?.textContent).toBe('Создан для встраивания');
    expect(page.querySelector('.use h3')?.textContent).toBe('Виджеты для чужих сайтов');
    expect(page.querySelector('.demo h3')?.textContent).toBe('Сигналы');
    await resetLocale();
  });
});
