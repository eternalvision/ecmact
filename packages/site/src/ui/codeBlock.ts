import { view } from '@site/lib/component';
import { el } from '@site/lib/dom';
import { highlight, type Language } from '@site/lib/highlight';
import { copyButton } from '@site/ui/copyButton';

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
export const highlighted = (code: string, language: Language) => {
  const body = el('code', { class: `language-${language}` });
  highlight(code, language).forEach((token) =>
    body.append(
      token.kind === 'plain' ? token.text : el('span', { class: `tok-${token.kind}` }, token.text),
    ),
  );
  return el('pre', { attrs: { tabindex: '0' } }, body);
};

/**
 * A block of code with a title and a copy button.
 *
 * @param props - The code, the language and the title.
 * @returns The component.
 */
export const CodeBlock = ({ code, language, title }: CodeBlockProps) =>
  view('CodeBlock', {
    tag: 'figure',
    class: 'code',
    children: [
      el(
        'figcaption',
        { class: 'code-bar' },
        el('span', { class: 'code-title' }, title ?? language),
        copyButton(code, 'code-copy'),
      ),
      highlighted(code, language),
    ],
  });
