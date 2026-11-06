import { afterEach, describe, expect, it } from 'vitest';
import { disposeRouters, makeRouter } from '@tests/helpers';
import { notFound } from '@site/pages/notFound';

afterEach(() => {
  disposeRouters();
  document.body.replaceChildren();
});

describe('notFound', () => {
  it('says so and offers two ways out', () => {
    const page = notFound(makeRouter('/nope'));
    document.body.append(page);
    expect(page.querySelector('h1')?.textContent).toBe('Page not found');
    expect([...page.querySelectorAll('a')].map((a) => a.textContent)).toEqual([
      'Back to the home page',
      'Read the docs',
    ]);
  });
});
