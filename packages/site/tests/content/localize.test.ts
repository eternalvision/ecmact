import { describe, expect, it } from 'vitest';
import { callout, code, demo, h2, h3, ol, p, table, ul } from '@site/content/builders';
import { localize, texts } from '@site/content/localize';
import type { DocPage } from '@site/content/types';

const page: DocPage = {
  slug: 'x',
  title: 'Title',
  summary: 'Summary.',
  group: 'Core',
  blocks: [
    h2('Heading'),
    h3('Sub'),
    p('Paragraph'),
    ul('a', 'b'),
    ol('c'),
    code('ts', 'const a = 1;', 'file.ts'),
    demo('counter'),
    callout('tip', 'Tip'),
    table(['H1', 'H2'], ['r1c1', 'r1c2'], ['r2c1', 'r2c2']),
  ],
};

describe('texts', () => {
  it('lists the title, the summary and every text of the blocks in order', () => {
    expect(texts(page)).toEqual([
      'Title',
      'Summary.',
      'Heading',
      'Sub',
      'Paragraph',
      'a',
      'b',
      'c',
      'Tip',
      'H1',
      'H2',
      'r1c1',
      'r1c2',
      'r2c1',
      'r2c2',
    ]);
  });
});

describe('localize', () => {
  const translated = texts(page).map((text) => `ru:${text}`);

  it('replaces every text and keeps code, demos and the shape', () => {
    const result = localize(page, translated);
    expect(result.title).toBe('ru:Title');
    expect(result.summary).toBe('ru:Summary.');
    expect(result.slug).toBe('x');
    expect(result.blocks.map((block) => block.type)).toEqual(
      page.blocks.map((block) => block.type),
    );
    expect(result.blocks[0]).toEqual({ type: 'h2', text: 'ru:Heading' });
    expect(result.blocks[3]).toEqual({ type: 'ul', items: ['ru:a', 'ru:b'] });
    expect(result.blocks[5]).toBe(page.blocks[5]);
    expect(result.blocks[6]).toBe(page.blocks[6]);
    expect(result.blocks[7]).toEqual({ type: 'callout', tone: 'tip', text: 'ru:Tip' });
    expect(result.blocks[8]).toEqual({
      type: 'table',
      head: ['ru:H1', 'ru:H2'],
      rows: [
        ['ru:r1c1', 'ru:r1c2'],
        ['ru:r2c1', 'ru:r2c2'],
      ],
    });
  });

  it('keeps the original where the translation is empty', () => {
    const result = localize(
      page,
      translated.map((text, index) => (index === 4 ? '' : text)),
    );
    expect(result.blocks[2]).toEqual({ type: 'p', text: 'Paragraph' });
  });

  it('does not change the original page', () => {
    localize(page, translated);
    expect(page.title).toBe('Title');
  });

  it('refuses a translation with the wrong number of strings', () => {
    expect(() => localize(page, ['only one'])).toThrow('expected 15 strings, got 1');
  });
});
