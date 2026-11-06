import { afterEach, describe, expect, it } from 'vitest';
import { demos } from '@site/demos/index';
import { examples } from '@site/pages/examples';

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
