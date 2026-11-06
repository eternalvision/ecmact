import { text } from '@site/content/messages';
import type { Block, TableBlock } from '@site/content/types';
import { findDemo } from '@site/demos/index';
import { el, slugify, type Content } from '@site/lib/dom';
import { parseInline } from '@site/lib/inline';
import { CodeBlock } from '@site/ui/codeBlock';
import { DemoFrame } from '@site/ui/demoFrame';

/** An entry of the table of contents of a page. */
export interface Heading {
  /** The id of the heading element, for the anchor. */
  id: string;
  /** The text of the heading. */
  text: string;
  /** 2 for a section, 3 for a subsection. */
  level: 2 | 3;
}

/** What `renderBlocks` produces. */
export interface Rendered {
  /** The nodes of the page, in order. */
  nodes: Node[];
  /** The headings, for the table of contents. */
  headings: Heading[];
}

/**
 * Renders a table block.
 *
 * @param block - The block.
 * @returns A scrollable wrapper with the table.
 */
export const renderTable = (block: TableBlock) =>
  el(
    'div',
    { class: 'table-wrap' },
    el(
      'table',
      {},
      el(
        'thead',
        {},
        el('tr', {}, ...block.head.map((cell) => el('th', {}, ...parseInline(cell)))),
      ),
      el(
        'tbody',
        {},
        ...block.rows.map((row) =>
          el('tr', {}, ...row.map((cell) => el('td', {}, ...parseInline(cell)))),
        ),
      ),
    ),
  );

/**
 * Renders the blocks of a page into DOM nodes and collects the headings. Text blocks are plain DOM; code and demos
 * are ECMact components.
 *
 * @param blocks - The blocks.
 * @returns The nodes and the headings.
 */
export const renderBlocks = (blocks: Block[]): Rendered => {
  const headings: Heading[] = [];
  const used = new Set<string>();

  /**
   * Gives a heading an id that is not used yet on the page.
   *
   * @param text - The heading text.
   * @returns The id.
   */
  const uniqueId = (text: string) => {
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  /**
   * Renders one block.
   *
   * @param block - The block.
   * @returns The node, or `undefined` for a demo that does not exist.
   */
  const render = (block: Block): Content => {
    switch (block.type) {
      case 'h2':
      case 'h3': {
        const id = uniqueId(block.text);
        headings.push({
          id,
          text: block.text.replace(/`/g, ''),
          level: block.type === 'h2' ? 2 : 3,
        });
        return el(block.type, { attrs: { id } }, ...parseInline(block.text));
      }
      case 'p':
        return el('p', {}, ...parseInline(block.text));
      case 'ul':
      case 'ol':
        return el(block.type, {}, ...block.items.map((item) => el('li', {}, ...parseInline(item))));
      case 'code':
        return CodeBlock({ code: block.code, language: block.language, title: block.title });
      case 'demo': {
        const demo = findDemo(block.id);
        return demo ? DemoFrame(demo) : undefined;
      }
      case 'callout':
        return el(
          'aside',
          { class: `callout callout-${block.tone}` },
          el('strong', {}, text().docs.callouts[block.tone]),
          el('p', {}, ...parseInline(block.text)),
        );
      case 'table':
        return renderTable(block);
    }
  };

  const nodes = blocks.map(render).filter((node): node is Node => node instanceof Node);
  return { nodes, headings };
};
