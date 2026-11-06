import { demos } from '@site/demos/index';
import { el } from '@site/lib/dom';
import { DemoFrame } from '@site/ui/demoFrame';

/**
 * The gallery: every demo, running, with its source one tab away.
 *
 * @returns The page.
 */
export const examples = () =>
  el(
    'main',
    { class: 'wrap page-simple' },
    el('h1', {}, 'Examples'),
    el(
      'p',
      { class: 'lead' },
      'Every example below is a live ECMact component. Switch to the Code tab to read the exact source that runs.',
    ),
    el('div', { class: 'demo-grid' }, ...demos.map((demo) => DemoFrame(demo))),
  );
