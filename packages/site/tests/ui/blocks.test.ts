import { afterEach, describe, expect, it } from 'vitest';
import { callout, code, demo, h2, h3, ol, p, table, ul } from '@site/content/builders';
import type { Block } from '@site/content/types';
import { renderBlocks } from '@site/ui/blocks';
import { resetLocale, useLocale } from '@tests/helpers';

afterEach(() => {
  document.body.replaceChildren();
});

const render = (...blocks: Block[]) => {
  const rendered = renderBlocks(blocks);
  const host = document.createElement('div');
  host.append(...rendered.nodes);
  document.body.append(host);
  return { host, ...rendered };
};

describe('renderBlocks', () => {
  it('renders headings with ids and collects them for the table of contents', () => {
    const { host, headings } = render(h2('First `thing`'), h3('Sub'), h2('First thing'));
    expect(host.querySelector('h2')?.id).toBe('first-thing');
    expect(host.querySelector('h2 code')?.textContent).toBe('thing');
    expect(host.querySelector('h3')?.id).toBe('sub');
    expect(headings).toEqual([
      { id: 'first-thing', text: 'First thing', level: 2 },
      { id: 'sub', text: 'Sub', level: 3 },
      { id: 'first-thing-2', text: 'First thing', level: 2 },
    ]);
  });

  it('gives a heading without letters a fallback id', () => {
    const { headings } = render(h2('???'));
    expect(headings[0]?.id).toBe('section');
  });

  it('renders an empty anchor for each alias of a heading, in front of its text', () => {
    const { host, headings } = render(
      { type: 'h2', text: 'New name', aliases: ['old-name', 'older-name'] },
      h3('Sub'),
    );
    const heading = host.querySelector('h2')!;
    expect([...heading.querySelectorAll('span.anchor')].map((span) => span.id)).toEqual([
      'old-name',
      'older-name',
    ]);
    expect(heading.querySelector('span')?.textContent).toBe('');
    expect(heading.lastChild?.textContent).toBe('New name');
    expect(host.querySelector('#old-name')?.parentElement).toBe(heading);
    expect(headings.map((entry) => entry.id)).toEqual(['new-name', 'sub']);
  });

  it('never lets an alias take the id of another heading or repeat', () => {
    const { host, headings } = render(
      { type: 'h2', text: 'One', aliases: ['two', 'shared'] },
      { type: 'h2', text: 'Two', aliases: ['shared'] },
    );
    expect(headings.map((entry) => entry.id)).toEqual(['one', 'two']);
    expect(host.querySelectorAll('#two')).toHaveLength(1);
    expect(host.querySelector('#two')?.localName).toBe('h2');
    expect(host.querySelectorAll('#shared')).toHaveLength(1);
    expect(host.querySelector('#shared')?.parentElement?.id).toBe('one');
  });

  it('renders paragraphs and lists with inline markup', () => {
    const { host } = render(p('use `x`'), ul('a', 'b **c**'), ol('one', 'two'));
    expect(host.querySelector('p code')?.textContent).toBe('x');
    expect(host.querySelectorAll('ul li')).toHaveLength(2);
    expect(host.querySelector('ul strong')?.textContent).toBe('c');
    expect(host.querySelectorAll('ol li')).toHaveLength(2);
  });

  it('renders code blocks and demos as components', () => {
    const { host } = render(code('ts', 'const a = 1;', 'file.ts'), demo('counter'));
    expect(host.querySelector('.code-title')?.textContent).toBe('file.ts');
    expect(host.querySelector('.demo')).not.toBeNull();
  });

  it('skips a demo that does not exist', () => {
    const { nodes } = render(demo('missing'));
    expect(nodes).toHaveLength(0);
  });

  it('renders callouts with their tone', () => {
    const { host } = render(
      callout('note', 'n'),
      callout('tip', 't'),
      callout('warning', 'w **x**'),
    );
    const labels = [...host.querySelectorAll('.callout > strong')].map((e) => e.textContent);
    expect(labels).toEqual(['Note', 'Tip', 'Warning']);
    expect(host.querySelector('.callout-warning p strong')?.textContent).toBe('x');
  });

  it('renders tables with inline markup in the cells', () => {
    const { host } = render(table(['A', 'B'], ['`x`', 'y'], ['z', '[l](/docs)']));
    expect(host.querySelectorAll('th')).toHaveLength(2);
    expect(host.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(host.querySelector('td code')?.textContent).toBe('x');
    expect(host.querySelector('td a')?.getAttribute('data-internal')).toBe('/docs');
  });

  it('lets a keyboard user focus and scroll a table', () => {
    const { host } = render(table(['A'], ['x']));
    const wrap = host.querySelector('.table-wrap')!;
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(wrap.getAttribute('role')).toBe('region');
    expect(wrap.getAttribute('aria-label')).toBe('Table');
  });
});

describe('renderBlocks in Russian', () => {
  it('labels callouts in Russian', async () => {
    await useLocale('ru');
    const { host } = render(callout('note', 'n'), callout('tip', 't'), callout('warning', 'w'));
    expect([...host.querySelectorAll('.callout > strong')].map((e) => e.textContent)).toEqual([
      'Заметка',
      'Совет',
      'Внимание',
    ]);
    expect(
      render(table(['A'], ['x']))
        .host.querySelector('.table-wrap')
        ?.getAttribute('aria-label'),
    ).toBe('Таблица');
    await resetLocale();
  });
});
