import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import { demos, groups } from '@site/demos/index';
import { DemoFrame } from '@site/ui/demoFrame';

const { div, h1, h2, main, p, section } = tags;

/**
 * The gallery: every demo, running on its stage and grouped by task, with its files one tab away.
 *
 * @returns The page.
 */
export const examples = () => {
  const m = text().examples;
  return main(
    { class: 'wrap page-simple' },
    h1(m.title),
    p({ class: 'lead' }, m.lead),
    groups.map((group) => {
      const copy = m.groups[group];
      return section(
        { class: 'demo-group', 'aria-label': copy.title },
        h2(copy.title),
        p({ class: 'section-lead' }, copy.lead),
        div({ class: 'demo-grid' }, demos.filter((demo) => demo.group === group).map(DemoFrame)),
      );
    }),
  );
};
