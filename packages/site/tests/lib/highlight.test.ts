import { describe, expect, it } from 'vitest';
import { highlight, type Language } from '@site/lib/highlight';

const kinds = (code: string, language: Language) =>
  highlight(code, language)
    .filter((token) => token.kind !== 'plain' && token.kind !== 'punctuation')
    .map((token) => `${token.kind}:${token.text}`);

describe('highlight', () => {
  it('gives back the source when the tokens are joined', () => {
    const samples: [string, Language][] = [
      ["const a = 'x'; // note\nfoo(1, `t`);", 'ts'],
      ['<div class="a" id=b><!-- c --></div>', 'html'],
      ['@media (min-width: 10px) { a:hover { color: #fff; margin: -1.5rem } }', 'css'],
      ['npm install --save ecmact # comment', 'bash'],
      ['{ "a": [1, 2.5e3, true, null] }', 'json'],
      ['anything at all', 'text'],
    ];
    samples.forEach(([code, language]) =>
      expect(
        highlight(code, language)
          .map((token) => token.text)
          .join(''),
      ).toBe(code),
    );
  });

  it('returns the text as one plain token for text', () => {
    expect(highlight('a b', 'text')).toEqual([{ kind: 'plain', text: 'a b' }]);
  });

  it('tells keywords, strings, numbers, comments, functions and types apart in TypeScript', () => {
    expect(kinds("const n = 42; // hi\nem.Card('x'); /* c */ type T = Foo;", 'ts')).toEqual([
      'keyword:const',
      'number:42',
      'comment:// hi',
      'function:Card',
      "string:'x'",
      'comment:/* c */',
      'keyword:type',
      'type:T',
      'type:Foo',
    ]);
  });

  it('does not take a word that starts like a keyword for one', () => {
    expect(kinds('important constant', 'ts')).toEqual([]);
  });

  it('reads template literals, double quotes and escaped quotes as strings', () => {
    expect(kinds("`a${b}` \"c\" 'd\\'e'", 'ts')).toEqual([
      'string:`a${b}`',
      'string:"c"',
      "string:'d\\'e'",
    ]);
  });

  it('keeps unknown characters as plain text', () => {
    expect(highlight('#', 'ts')).toEqual([{ kind: 'plain', text: '#' }]);
  });

  it('tells tags, attributes, strings and comments apart in HTML', () => {
    expect(kinds('<a href="/x" hidden><!-- c --></a>', 'html')).toEqual([
      'tag:<a',
      'attribute:href',
      'string:"/x"',
      'tag:>',
      'comment:<!-- c -->',
      'tag:</a>',
    ]);
  });

  it('tells at-rules, properties, values and colors apart in CSS', () => {
    const tokens = kinds(
      '@media a { p { color: #fff; margin: -1.5rem; width: calc(1px) } /* c */ }',
      'css',
    );
    expect(tokens).toContain('keyword:@media');
    expect(tokens).toContain('attribute:color');
    expect(tokens).toContain('number:#fff');
    expect(tokens).toContain('number:-1.5rem');
    expect(tokens).toContain('function:calc');
    expect(tokens).toContain('comment:/* c */');
  });

  it('tells commands, flags, strings and comments apart in a shell', () => {
    expect(kinds("npm install --save 'x' # done", 'bash')).toEqual([
      'keyword:npm',
      'attribute:--save',
      "string:'x'",
      'comment:# done',
    ]);
  });

  it('tells keys, strings, numbers and keywords apart in JSON', () => {
    expect(kinds('{"a": "b", "n": -1.5e3, "t": true, "z": null}', 'json')).toEqual([
      'attribute:"a"',
      'string:"b"',
      'attribute:"n"',
      'number:-1.5e3',
      'attribute:"t"',
      'keyword:true',
      'attribute:"z"',
      'keyword:null',
    ]);
  });

  it('joins neighbours of the same kind and handles empty input', () => {
    expect(highlight('((', 'ts')).toEqual([{ kind: 'punctuation', text: '((' }]);
    expect(highlight('', 'ts')).toEqual([]);
  });
});
