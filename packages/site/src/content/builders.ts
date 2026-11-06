import type { Block, CodeBlock } from '@site/content/types';
import type { Language } from '@site/lib/highlight';

/**
 * Writes a second-level heading.
 *
 * @param text - The heading.
 * @returns The block.
 */
export const h2 = (text: string): Block => ({ type: 'h2', text });

/**
 * Writes a third-level heading.
 *
 * @param text - The heading.
 * @returns The block.
 */
export const h3 = (text: string): Block => ({ type: 'h3', text });

/**
 * Writes a paragraph.
 *
 * @param text - The text, with inline markup.
 * @returns The block.
 */
export const p = (text: string): Block => ({ type: 'p', text });

/**
 * Writes a bulleted list.
 *
 * @param items - The items.
 * @returns The block.
 */
export const ul = (...items: string[]): Block => ({ type: 'ul', items });

/**
 * Writes a numbered list.
 *
 * @param items - The items.
 * @returns The block.
 */
export const ol = (...items: string[]): Block => ({ type: 'ol', items });

/**
 * Writes a block of code. Leading and trailing blank lines are removed.
 *
 * @param language - The language.
 * @param code - The source.
 * @param title - A file name or caption.
 * @returns The block.
 */
export const code = (language: Language, code: string, title?: string): CodeBlock => ({
  type: 'code',
  language,
  code: code.replace(/^\n+/, '').trimEnd(),
  ...(title === undefined ? {} : { title }),
});

/**
 * Embeds a live demo.
 *
 * @param id - The id of the demo.
 * @returns The block.
 */
export const demo = (id: string): Block => ({ type: 'demo', id });

/**
 * Writes a highlighted remark.
 *
 * @param tone - How serious it is.
 * @param text - The text, with inline markup.
 * @returns The block.
 */
export const callout = (tone: 'note' | 'tip' | 'warning', text: string): Block => ({
  type: 'callout',
  tone,
  text,
});

/**
 * Writes a table.
 *
 * @param head - The column titles.
 * @param rows - The rows.
 * @returns The block.
 */
export const table = (head: string[], ...rows: string[][]): Block => ({
  type: 'table',
  head,
  rows,
});
