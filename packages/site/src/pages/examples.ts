import { text } from '@site/content/messages';
import { demos } from '@site/demos/index';
import { el } from '@site/lib/dom';
import { DemoFrame } from '@site/ui/demoFrame';

/**
 * The gallery: every demo, running, with its source one tab away.
 *
 * @returns The page.
 */
export const examples = () => {
  const m = text().examples;
  return el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, m.title),
    el('p', { class: 'lead' }, m.lead),
    el('div', { class: 'demo-grid' }, ...demos.map((demo) => DemoFrame(demo))),
  );
};
