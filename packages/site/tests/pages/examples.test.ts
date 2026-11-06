import { afterEach, describe, expect, it } from 'vitest';
import { demos } from '@site/demos/index';
import { examples } from '@site/pages/examples';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
});

describe('examples', () => {
  it('shows every demo', () => {
    const page = examples();
    document.body.append(page);
    expect(page.querySelector('h1')?.textContent).toBe('Examples');
    expect(page.querySelectorAll('.demo')).toHaveLength(demos.length);
  });
});

describe('examples in Russian', () => {
  it('has the title and the lead in Russian', async () => {
    await useLocale('ru');
    const page = examples();
    expect(page.querySelector('h1')?.textContent).toBe('Примеры');
    expect(page.querySelector('.lead')?.textContent).toContain('живой компонент');
    await resetLocale();
  });
});
