import type { Language } from '@site/lib/highlight';

/** A section heading. It becomes an anchor and an entry of the table of contents. */
export interface HeadingBlock {
  /** Marks the block as a heading. */
  type: 'h2' | 'h3';
  /** The heading text. Inline `code` is allowed. */
  text: string;
}

/** A paragraph. */
export interface ParagraphBlock {
  /** Marks the block as a paragraph. */
  type: 'p';
  /** The text, with inline `code`, **bold** and [links](/docs/routing). */
  text: string;
}

/** A list. */
export interface ListBlock {
  /** Bulleted or numbered. */
  type: 'ul' | 'ol';
  /** One text per item, with the same inline markup as a paragraph. */
  items: string[];
}

/** A block of code with a copy button. */
export interface CodeBlock {
  /** Marks the block as code. */
  type: 'code';
  /** The language, for highlighting. */
  language: Language;
  /** The source. */
  code: string;
  /** A file name or a caption shown above the code. */
  title?: string;
}

/** A live demo with its source. */
export interface DemoBlock {
  /** Marks the block as a demo. */
  type: 'demo';
  /** The id of the demo in the registry. */
  id: string;
}

/** A highlighted remark. */
export interface CalloutBlock {
  /** Marks the block as a callout. */
  type: 'callout';
  /** How serious it is. */
  tone: 'note' | 'tip' | 'warning';
  /** The text, with inline markup. */
  text: string;
}

/** A table. */
export interface TableBlock {
  /** Marks the block as a table. */
  type: 'table';
  /** The column titles. */
  head: string[];
  /** The rows. Cells have inline markup. */
  rows: string[][];
}

/** One piece of a documentation page. */
export type Block =
  HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | DemoBlock | CalloutBlock | TableBlock;

/** The groups of the sidebar, in order. */
export type DocGroup = 'Start' | 'Core' | 'Application' | 'Delivery' | 'Reference';

/** A documentation page. */
export interface DocPage {
  /** The last part of the URL: `/docs/<slug>`. */
  slug: string;
  /** The title of the page. */
  title: string;
  /** One sentence for the page header, the sidebar tooltip and the search results. */
  summary: string;
  /** The group in the sidebar. */
  group: DocGroup;
  /** The content. */
  blocks: Block[];
}
