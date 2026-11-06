/** The kinds of token the highlighter tells apart. They map to the `tok-*` classes of the stylesheet. */
export type TokenKind =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'function'
  | 'type'
  | 'tag'
  | 'attribute'
  | 'punctuation'
  | 'plain';

/** A piece of source text and what it is. */
export interface Token {
  /** What the text is. */
  kind: TokenKind;
  /** The text. */
  text: string;
}

/** The languages that the highlighter knows. */
export type Language = 'ts' | 'html' | 'css' | 'bash' | 'json' | 'text';

/** A rule of the scanner: what a match is, and the sticky pattern that finds it. */
type Rule = readonly [TokenKind, RegExp];

const typescript: Rule[] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ['string', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y],
  ['number', /\b\d[\d_]*(?:\.\d+)?\b/y],
  [
    'keyword',
    /\b(?:import|export|from|const|let|var|function|return|if|else|for|while|await|async|new|type|interface|extends|typeof|of|in|as|default|throw|try|catch|class|void|null|undefined|true|false|declare|readonly)\b/y,
  ],
  ['function', /[A-Za-z_$][\w$]*(?=\()/y],
  ['type', /\b[A-Z][\w$]*\b/y],
  ['plain', /[A-Za-z_$][\w$]*/y],
  ['punctuation', /[{}()[\];,.<>:=+\-*/!?&|%^~@]+/y],
];

const markup: Rule[] = [
  ['comment', /<!--[\s\S]*?-->/y],
  ['tag', /<\/?[A-Za-z][\w-]*|\/?>/y],
  ['string', /"[^"]*"|'[^']*'/y],
  ['attribute', /[A-Za-z_:@][\w:.-]*(?==)/y],
  ['punctuation', /=/y],
  ['plain', /[^<>="'\s]+/y],
];

const stylesheet: Rule[] = [
  ['comment', /\/\*[\s\S]*?\*\//y],
  ['string', /'[^']*'|"[^"]*"/y],
  ['keyword', /@[\w-]+/y],
  ['function', /[\w-]+(?=\()/y],
  ['attribute', /--?[A-Za-z][\w-]*(?=\s*:)|[A-Za-z][\w-]*(?=\s*:)/y],
  ['number', /#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?\b/y],
  ['plain', /[A-Za-z_-][\w-]*/y],
  ['punctuation', /[{}();:,.>+~*[\]=&]+/y],
];

const shell: Rule[] = [
  ['comment', /#[^\n]*/y],
  ['string', /'[^']*'|"[^"]*"/y],
  ['keyword', /\b(?:npm|npx|pnpm|yarn|bun|git|cd|node|mkdir|echo)\b/y],
  ['attribute', /--?[A-Za-z][\w-]*/y],
  ['plain', /[^\s'"#]+/y],
];

const data: Rule[] = [
  ['attribute', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
  ['string', /"(?:\\.|[^"\\])*"/y],
  ['number', /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
  ['keyword', /\b(?:true|false|null)\b/y],
  ['punctuation', /[{}[\],:]/y],
];

const rules: Record<Exclude<Language, 'text'>, Rule[]> = {
  ts: typescript,
  html: markup,
  css: stylesheet,
  bash: shell,
  json: data,
};

/**
 * Appends a token, joining it to the previous one when they are the same kind.
 *
 * @param tokens - The tokens so far.
 * @param kind - The kind of the new token.
 * @param text - The text of the new token.
 */
const push = (tokens: Token[], kind: TokenKind, text: string) => {
  const last = tokens.at(-1);
  if (last?.kind === kind) last.text += text;
  else tokens.push({ kind, text });
};

/**
 * Splits source code into tokens for highlighting. It is a small scanner, not a parser: good enough to colour
 * the examples of the documentation, and it never fails on text it does not understand.
 *
 * @example
 * highlight('const a = 1;', 'ts');
 *
 * @param code - The source text.
 * @param language - The language of the text.
 * @returns The tokens; joining their texts gives back the source.
 */
export const highlight = (code: string, language: Language): Token[] => {
  if (language === 'text') return [{ kind: 'plain', text: code }];
  const table = rules[language];
  const tokens: Token[] = [];
  let position = 0;
  while (position < code.length) {
    let matched = false;
    for (const [kind, pattern] of table) {
      pattern.lastIndex = position;
      const result = pattern.exec(code);
      if (result && result[0] !== '') {
        push(tokens, kind, result[0]);
        position += result[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      push(tokens, 'plain', code[position] as string);
      position += 1;
    }
  }
  return tokens;
};
