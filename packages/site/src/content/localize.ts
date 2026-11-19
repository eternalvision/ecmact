import type { Block, DocPage, HeadingBlock } from '@site/content/types';
import { anchorIds } from '@site/lib/anchors';

/**
 * Lists the strings of a page that a translator has to write, in a fixed order: the title, the summary, then the
 * text of every block (a list contributes its items, a table its head and then its cells row by row). Code and
 * demos have no text to translate.
 *
 * @param page - The page.
 * @returns The strings, in order.
 */
export const texts = (page: DocPage): string[] => [
  page.title,
  page.summary,
  ...page.blocks.flatMap((block): string[] => {
    switch (block.type) {
      case 'h2':
      case 'h3':
      case 'p':
      case 'callout':
        return [block.text];
      case 'ul':
      case 'ol':
        return block.items;
      case 'table':
        return [...block.head, ...block.rows.flat()];
      default:
        return [];
    }
  }),
];

/**
 * Lists the headings of a list of blocks.
 *
 * @param blocks - The blocks.
 * @returns The heading blocks, in order.
 */
const headingsOf = (blocks: Block[]) =>
  blocks.filter((block): block is HeadingBlock => block.type === 'h2' || block.type === 'h3');

/**
 * Lets a translated heading answer to the id of the original one. The id comes from the text, so a translation
 * changes it, and a link made from the original page (or from the baseline of the site) must still land on the
 * section.
 *
 * @param original - The blocks in the original language.
 * @param translated - The same blocks, translated.
 * @returns The translated blocks, with an alias on each heading whose id changed.
 */
const keepAddresses = (original: Block[], translated: Block[]): Block[] => {
  const before = anchorIds(headingsOf(original).map((heading) => heading.text));
  const after = anchorIds(headingsOf(translated).map((heading) => heading.text));
  let index = 0;
  return translated.map((block) => {
    if (block.type !== 'h2' && block.type !== 'h3') return block;
    const at = index++;
    return before[at] === after[at]
      ? block
      : { ...block, aliases: [...(block.aliases ?? []), before[at] as string] };
  });
};

/**
 * Makes a translated copy of a page. `translated` holds one string for each string that `texts` lists, in the same
 * order; an empty string keeps the original, for text that is the same in both languages. Code and demos are shared
 * with the original, so a translation can never drift from the code it explains.
 *
 * @param page - The page in the original language.
 * @param translated - The translations, in the order of `texts`.
 * @returns The translated page.
 * @throws {Error} If `translated` does not have as many strings as the page has.
 */
export const localize = (page: DocPage, translated: string[]): DocPage => {
  const source = texts(page);
  if (translated.length !== source.length) {
    throw new Error(`${page.slug}: expected ${source.length} strings, got ${translated.length}`);
  }
  let index = 0;

  /**
   * Takes the next translation, or the original text where the translation is empty.
   *
   * @returns The text to use.
   */
  const next = () => {
    const original = source[index] as string;
    const text = translated[index] as string;
    index += 1;
    return text === '' ? original : text;
  };

  const title = next();
  const summary = next();
  const blocks = page.blocks.map((block): Block => {
    switch (block.type) {
      case 'h2':
      case 'h3':
      case 'p':
      case 'callout':
        return { ...block, text: next() };
      case 'ul':
      case 'ol':
        return { ...block, items: block.items.map(next) };
      case 'table':
        return {
          ...block,
          head: block.head.map(next),
          rows: block.rows.map((row) => row.map(next)),
        };
      default:
        return block;
    }
  });
  return { ...page, title, summary, blocks: keepAddresses(page.blocks, blocks) };
};
