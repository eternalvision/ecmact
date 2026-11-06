import { describe, expect, it } from 'vitest';
import { Toc } from '@site/ui/toc';

describe('Toc', () => {
  it('lists the headings as anchors and marks the subsections', () => {
    const toc = Toc([
      { id: 'a', text: 'A', level: 2 },
      { id: 'b', text: 'B', level: 3 },
    ]);
    const items = [...toc.querySelectorAll('li')];
    expect(toc.getAttribute('aria-label')).toBe('On this page');
    expect(items.map((item) => item.querySelector('a')?.getAttribute('href'))).toEqual([
      '#a',
      '#b',
    ]);
    expect(items.map((item) => item.className)).toEqual(['', 'toc-sub']);
  });
});
