import { tags, type Router } from 'ecmact';
import { text } from '@site/content/messages';
import { demos, findDemo, groups, type Demo } from '@site/demos/index';
import { followInternalLinks } from '@site/lib/links';
import { CodeBlock } from '@site/ui/codeBlock';
import { DemoFrame } from '@site/ui/demoFrame';

const { div, h1, h2, main, p, section, span } = tags;

/**
 * The gallery: every demo, running on its stage and grouped by task, with its files one tab away. A link to a page
 * of the site, such as the guide of a demo, opens through the router.
 *
 * @param router - The router.
 * @returns The page.
 */
export const examples = (router: Router) => {
  const m = text().examples;
  const page = main(
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
  followInternalLinks(page, router);
  return page;
};

/**
 * The page of the atlas: the example that is a branch of the routes of the site, with its source under it.
 *
 * @param router - The router.
 * @param stage - The map of the atlas, made by its route.
 * @returns The page.
 */
export const atlasPage = (router: Router, stage: Node) => {
  const m = text();
  const demo = findDemo('atlas') as Demo;
  return main(
    { class: 'wrap page-simple' },
    p({ class: 'demo-note demo-back' }, router.link({ to: '/examples' }, m.atlas.back)),
    h1(m.atlas.title),
    p({ class: 'lead' }, m.atlas.lead),
    section(
      { class: 'demo', 'aria-label': m.atlas.title },
      div(
        { class: 'demo-run' },
        div({ class: 'stage-bar' }, span(m.code.stage)),
        div({ class: 'stage' }, stage),
      ),
    ),
    h2(m.atlas.source),
    CodeBlock({
      code: (demo.files[0] as Demo['files'][0]).source,
      language: 'ts',
      title: 'atlas.ts',
    }),
  );
};
