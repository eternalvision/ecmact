import { tags } from 'ecmact';
import { text } from '@site/content/messages';
import { demos } from '@site/demos/index';
import { DemoFrame } from '@site/ui/demoFrame';

const { div, h1, main, p } = tags;

/**
 * The gallery: every demo, running, with its source one tab away.
 *
 * @returns The page.
 */
export const examples = () => {
  const m = text().examples;
  return main(
    { class: 'wrap page-simple' },
    h1(m.title),
    p({ class: 'lead' }, m.lead),
    div({ class: 'demo-grid' }, demos.map(DemoFrame)),
  );
};
