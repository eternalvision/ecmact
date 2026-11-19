import { mount } from 'ecmact';
import { afterEach, describe, expect, it } from 'vitest';
import { demos, groups } from '@site/demos/index';
import { examples } from '@site/pages/examples';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
});

describe('examples', () => {
  it('shows every demo, grouped by task', () => {
    const page = examples();
    mount(document.body, page);
    expect(page.querySelector('h1')?.textContent).toBe('Examples');
    expect(page.querySelectorAll('.demo')).toHaveLength(demos.length);
    expect(page.querySelectorAll('.demo-group')).toHaveLength(groups.length);
    expect([...page.querySelectorAll('h2')].map((heading) => heading.textContent)).toEqual([
      'State and signals',
      'Interface',
      'Requests and data',
      'Lifecycle and widgets',
    ]);
    const first = page.querySelector('.demo-group')!;
    expect([...first.querySelectorAll('.demo h3')].map((heading) => heading.textContent)).toEqual([
      'Exposure triangle',
      'Setlist for tonight',
      'Field notebook',
    ]);
  });
});

describe('examples in Russian', () => {
  it('has the title, the lead and the groups in Russian', async () => {
    await useLocale('ru');
    const page = examples();
    expect(page.querySelector('h1')?.textContent).toBe('Примеры');
    expect(page.querySelector('.lead')?.textContent).toContain('на своей сцене');
    expect(page.querySelector('h2')?.textContent).toBe('Состояние и сигналы');
    await resetLocale();
  });
});
