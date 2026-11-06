import { docs, groups } from '@site/content/docs/index';
import type { DocPage } from '@site/content/types';
import { findDemo } from '@site/demos/index';

const languages = ['ts', 'html', 'css', 'bash', 'json', 'text'];

const texts = (page: DocPage) =>
  page.blocks.flatMap((block) => {
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
  });

export const validatePage = (page: DocPage, slug: string) => {
  const problems: string[] = [];
  const known = new Set(['/', '/examples', ...docs.map((doc) => `/docs/${doc.slug}`)]);
  if (page.slug !== slug) problems.push(`slug is ${page.slug}, expected ${slug}`);
  if (page.title.trim() === '') problems.push('empty title');
  if (!page.summary.endsWith('.')) problems.push('the summary does not end with a full stop');
  if (!groups.includes(page.group)) problems.push(`unknown group ${page.group}`);
  if (page.blocks.length === 0) problems.push('no blocks');

  const headings = page.blocks.flatMap((block) => (block.type === 'h2' ? [block.text] : []));
  if (new Set(headings).size !== headings.length) problems.push('duplicate h2 headings');

  page.blocks.forEach((block, index) => {
    if (block.type === 'demo' && !findDemo(block.id))
      problems.push(`block ${index}: no demo ${block.id}`);
    if (block.type === 'code') {
      if (block.code.trim() === '') problems.push(`block ${index}: empty code`);
      if (!languages.includes(block.language))
        problems.push(`block ${index}: language ${block.language}`);
    }
    if (block.type === 'table') {
      if (block.rows.length === 0) problems.push(`block ${index}: table without rows`);
      block.rows.forEach((row) => {
        if (row.length !== block.head.length)
          problems.push(`block ${index}: row ${row[0]} has ${row.length} cells`);
      });
    }
    if ((block.type === 'ul' || block.type === 'ol') && block.items.length === 0) {
      problems.push(`block ${index}: empty list`);
    }
  });

  texts(page).forEach((text) => {
    if ((text.match(/`/g) ?? []).length % 2 !== 0)
      problems.push(`unbalanced backticks in: ${text}`);
    for (const link of text.matchAll(/\]\((\/[^)]*)\)/g)) {
      if (!known.has(link[1] as string)) problems.push(`broken link ${link[1]}`);
    }
  });
  return problems;
};
