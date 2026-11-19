import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import type { Block, HeadingBlock, TableBlock } from '@site/content/types';
import { findDemo } from '@site/demos/index';
import { anchorIds, headingAliases } from '@site/lib/anchors';
import { parseInline } from '@site/lib/inline';
import { CodeBlock } from '@site/ui/codeBlock';
import { DemoFrame } from '@site/ui/demoFrame';

const { aside, div, li, p, span, strong, table, tbody, td, th, thead, tr } = tags;

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
 * Keeps a table wrapper reachable by keyboard only while it scrolls. A wrapper that overflows takes the focus, so a
 * keyboard user can scroll it, and it is a region named by the heading above the table (or by a generic label when
 * there is none). The check runs again when the wrapper or its table changes size.
 *
 * @param wrap - The wrapper.
 * @param labelledBy - The id of the heading above the table, if there is one.
 */
const watchOverflow = (wrap: HTMLElement, labelledBy?: string) => {
  /**
   * Gives the wrapper or takes from it the focus and the region role. Stops watching a wrapper that left the page.
   */
  const update = () => {
    if (!wrap.isConnected) {
      observer.disconnect();
    } else if (wrap.scrollWidth > wrap.clientWidth) {
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'region');
      if (labelledBy) wrap.setAttribute('aria-labelledby', labelledBy);
      else wrap.setAttribute('aria-label', text().docs.table);
    } else {
      ['tabindex', 'role', 'aria-labelledby', 'aria-label'].forEach((name) => {
        wrap.removeAttribute(name);
      });
    }
  };
  const observer = new ResizeObserver(update);
  observer.observe(wrap);
  observer.observe(wrap.firstElementChild as Element);
};

/**
 * Renders a table block.
 *
 * @param block - The block.
 * @param labelledBy - The id of the heading above the table, which names it when it scrolls.
 * @returns A wrapper that scrolls sideways, with the table.
 */
export const renderTable = (block: TableBlock, labelledBy?: string) => {
  const wrap = div(
    { class: 'table-wrap' },
    table(
      thead(tr(block.head.map((cell) => th(parseInline(cell))))),
      tbody(block.rows.map((row) => tr(row.map((cell) => td(parseInline(cell)))))),
    ),
  );
  watchOverflow(wrap, labelledBy);
  return wrap;
};

/**
 * Renders the blocks of a page into DOM nodes and collects the headings. A heading has the id of its text and an
 * empty `span` for each of its aliases, so that an old link still lands on it. Demos that do not exist are left out.
 *
 * @param blocks - The blocks.
 * @returns The nodes and the headings.
 */
export const renderBlocks = (blocks: Block[]): Rendered => {
  const headings: Heading[] = [];
  const headingBlocks = blocks.filter(
    (block): block is HeadingBlock => block.type === 'h2' || block.type === 'h3',
  );
  const ids = anchorIds(headingBlocks.map((block) => block.text));
  const aliases = headingAliases(
    ids,
    headingBlocks.map((block) => block.aliases),
  );
  let position = 0;
  let lastHeading: string | undefined;

  /**
   * Renders one block.
   *
   * @param block - The block.
   * @returns The node, or `undefined` for a demo that does not exist.
   */
  const render = (block: Block): Node | undefined => {
    switch (block.type) {
      case 'h2':
      case 'h3': {
        const at = position++;
        const id = ids[at] as string;
        lastHeading = id;
        headings.push({
          id,
          text: block.text.replace(/`/g, ''),
          level: block.type === 'h2' ? 2 : 3,
        });
        return tags[block.type](
          { id, tabindex: -1 },
          (aliases[at] as string[]).map((alias) =>
            span({ id: alias, class: 'anchor', tabindex: -1 }),
          ),
          parseInline(block.text),
        );
      }
      case 'p':
        return p(parseInline(block.text));
      case 'ul':
      case 'ol':
        return tags[block.type](block.items.map((item) => li(parseInline(item))));
      case 'code':
        return CodeBlock({ code: block.code, language: block.language, title: block.title });
      case 'demo': {
        const demo = findDemo(block.id);
        return demo && DemoFrame(demo);
      }
      case 'callout':
        return aside(
          { class: `callout callout-${block.tone}` },
          strong(text().docs.callouts[block.tone]),
          p(parseInline(block.text)),
        );
      case 'table':
        return renderTable(block, lastHeading);
    }
  };

  const nodes = blocks.map(render).filter((node) => node !== undefined);
  return { nodes, headings };
};
