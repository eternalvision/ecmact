import { mount } from 'ecmact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { demos, groups } from '@site/demos/index';
import { atlasPage, examples } from '@site/pages/examples';
import { disposeRouters, makeRouter, resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  disposeRouters();
  vi.unstubAllEnvs();
  document.body.replaceChildren();
});

describe('examples', () => {
  it('shows every demo, grouped by task', () => {
    const page = examples(makeRouter('/examples'));
    mount(document.body, page);
    expect(page.querySelector('h1')?.textContent).toBe('Examples');
    expect(page.querySelectorAll('.demo')).toHaveLength(demos.length);
    expect(page.querySelectorAll('.demo-group')).toHaveLength(groups.length);
    expect([...page.querySelectorAll('h2')].map((heading) => heading.textContent)).toEqual([
      'State and signals',
      'Interface',
      'Requests and data',
      'Lifecycle, widgets and routes',
    ]);
    const first = page.querySelector('.demo-group')!;
    expect([...first.querySelectorAll('.demo h3')].map((heading) => heading.textContent)).toEqual([
      'Exposure triangle',
      'Setlist for tonight',
      'Field notebook',
    ]);
    expect([...page.querySelectorAll('.demo h3')].map((heading) => heading.textContent)).toEqual([
      'Exposure triangle',
      'Setlist for tonight',
      'Field notebook',
      'Wood-type poster',
      'Customs declaration',
      'Lighting plot',
      'Telephone exchange',
      'Library card catalogue',
      'Ferry departures',
      'Darkroom trays',
      'Seed packet',
      'Pocket atlas',
    ]);
  });

  it('says that no example needs a network', () => {
    expect(examples(makeRouter('/examples')).querySelector('.lead')?.textContent).toContain(
      'none of them needs a network',
    );
  });

  it('opens a link to a page of the site through the router, without loading the page again', async () => {
    vi.stubEnv('BASE_URL', '/');
    const router = makeRouter('/examples');
    const page = examples(router);
    mount(document.body, page);
    page.querySelector<HTMLAnchorElement>('.demo-open a')!.click();
    await vi.waitFor(() => expect(router.location.value.path).toBe('/examples/atlas'));
  });
});

describe('atlasPage', () => {
  it('shows the stage of the atlas, a way back to the gallery and the source of the example', () => {
    const router = makeRouter('/examples/atlas');
    const stage = document.createElement('p');
    stage.textContent = 'the island';
    const page = atlasPage(router, stage);
    mount(document.body, page);
    expect(page.querySelector('h1')?.textContent).toBe('Pocket atlas');
    expect(page.querySelector('.stage')?.firstElementChild).toBe(stage);
    expect(page.querySelector('.demo-back a')?.getAttribute('href')).toBe('/examples');
    expect(page.querySelector('.demo-back a')?.textContent).toBe('Back to the examples');
    expect(page.querySelector('h2')?.textContent).toBe('The source of this example');
    expect(page.querySelector('.code-title')?.textContent).toBe('atlas.ts');
    expect(page.querySelector('pre')?.textContent).toContain('atlasRoute');
  });

  it('is in Russian when the language is', async () => {
    await useLocale('ru');
    const page = atlasPage(makeRouter('/examples/atlas'), document.createElement('p'));
    expect(page.querySelector('h1')?.textContent).toBe('Карманный атлас');
    expect(page.querySelector('.demo-back a')?.textContent).toBe('Назад к примерам');
    await resetLocale();
  });
});

describe('examples in Russian', () => {
  it('has the title, the lead and the groups in Russian', async () => {
    await useLocale('ru');
    const page = examples(makeRouter('/examples'));
    expect(page.querySelector('h1')?.textContent).toBe('Примеры');
    expect(page.querySelector('.lead')?.textContent).toContain('на своей сцене');
    expect(page.querySelector('h2')?.textContent).toBe('Состояние и сигналы');
    await resetLocale();
  });
});
