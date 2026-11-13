import { tags } from 'ecmact';
import { highlight, type Language } from '@site/lib/highlight';
import { copyButton } from '@site/ui/copyButton';

const { code: codeTag, figcaption, figure, pre, span } = tags;

/** What `CodeBlock` shows. */
export interface CodeBlockProps {
  /** The source text. */
  code: string;
  /** The language, for highlighting. */
  language: Language;
  /** A file name or caption above the code. */
  title?: string;
}

/**
 * Builds the highlighted `pre` for a piece of code.
 *
 * @param code - The source text.
 * @param language - The language.
 * @returns The `pre` element.
 */
export const highlighted = (code: string, language: Language) =>
  pre(
    { tabindex: 0 },
    codeTag(
      { class: `language-${language}` },
      highlight(code, language).map((token) =>
        token.kind === 'plain' ? token.text : span({ class: `tok-${token.kind}` }, token.text),
      ),
    ),
  );

/**
 * A block of code with a title and a copy button.
 *
 * @param props - The code, the language and the title.
 * @returns The `figure` element.
 */
export const CodeBlock = ({ code, language, title }: CodeBlockProps) =>
  figure(
    { class: 'code' },
    figcaption(
      { class: 'code-bar' },
      span({ class: 'code-title' }, title ?? language),
      copyButton(code, 'code-copy'),
    ),
    highlighted(code, language),
  );
