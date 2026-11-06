import { describe, expect, it } from 'vitest';
import { callout, code, demo, h2, h3, ol, p, table, ul } from '@site/content/builders';

describe('builders', () => {
  it('build the blocks of a page', () => {
    expect(h2('a')).toEqual({ type: 'h2', text: 'a' });
    expect(h3('b')).toEqual({ type: 'h3', text: 'b' });
    expect(p('c')).toEqual({ type: 'p', text: 'c' });
    expect(ul('x', 'y')).toEqual({ type: 'ul', items: ['x', 'y'] });
    expect(ol('x')).toEqual({ type: 'ol', items: ['x'] });
    expect(demo('counter')).toEqual({ type: 'demo', id: 'counter' });
    expect(callout('tip', 't')).toEqual({ type: 'callout', tone: 'tip', text: 't' });
    expect(table(['A', 'B'], ['1', '2'], ['3', '4'])).toEqual({
      type: 'table',
      head: ['A', 'B'],
      rows: [
        ['1', '2'],
        ['3', '4'],
      ],
    });
  });

  it('trims the blank lines around code, and keeps a title only when there is one', () => {
    expect(code('ts', '\n\nconst a = 1;\n  \n')).toEqual({
      type: 'code',
      language: 'ts',
      code: 'const a = 1;',
    });
    expect(code('bash', 'npm i', 'install')).toEqual({
      type: 'code',
      language: 'bash',
      code: 'npm i',
      title: 'install',
    });
  });
});
