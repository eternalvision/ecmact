import { api } from '@site/content/api';
import { h2, p, table } from '@site/content/builders';
import type { Block, DocPage } from '@site/content/types';

/**
 * Builds the blocks of the reference: a heading and a table per area.
 *
 * @returns The blocks.
 */
const blocks = (): Block[] =>
  Object.entries(api).flatMap(([area, entries]) => [
    h2(area),
    table(
      ['Export', 'What it is', 'Read'],
      ...entries.map((entry) => [
        `\`${entry.name}\``,
        entry.summary,
        `[docs](/docs/${entry.page})`,
      ]),
    ),
  ]);

/** The list of everything the package exports. */
export const page: DocPage = {
  slug: 'api',
  title: 'API reference',
  summary: 'Every export of the package in one place, with a link to where it is explained.',
  group: 'Reference',
  blocks: [
    p(
      'Everything is imported from `ecmact`. The package is ES and CommonJS, has no runtime dependencies and is tree-shakeable, so you pay only for what you import.',
    ),
    ...blocks(),
  ],
};
