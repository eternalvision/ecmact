import { tags, type Router } from 'ecmact';
import { featuresFor, useCasesFor } from '@site/content/features';
import { text } from '@site/content/messages';
import { create, entryName, markup, markupName, source } from '@site/demos/estimate';
import { findDemo } from '@site/demos/index';
import { icon } from '@site/lib/dom';
import { currentLocale } from '@site/lib/i18n';
import { parseInline } from '@site/lib/inline';
import { CodeBlock } from '@site/ui/codeBlock';
import { copyButton } from '@site/ui/copyButton';
import { DemoFrame } from '@site/ui/demoFrame';
import { external, outside } from '@site/ui/header';

const { a, code, div, h1, h2, h3, img, li, main, p, section, span, strong, ul } = tags;

const install = 'npm create ecmact@latest my-app';

/**
 * Reads the texts of the home page in the language in use.
 *
 * @returns The texts.
 */
const m = () => text().home;

const app = `
import { createHttp, createRouter, createStore, mount, tags } from 'ecmact';

const api = createHttp({ baseURL: '/api', retry: 2 });
const cart = createStore({ count: 0 }, (set) => ({
  add: () => set((state) => ({ count: state.count + 1 })),
}));

const router = createRouter({
  routes: [
    { path: '/', view: () => tags.h1('Shop') },
    {
      path: '/products',
      view: () => {
        const products = api.resource('/products');
        return tags.p(() => (products.loading ? 'Loading...' : 'Loaded'));
      },
    },
  ],
});

mount(
  '#app',
  tags.button({ onclick: cart.add }, () => \`Cart (\${cart.count})\`),
  router.outlet(),
);
`;

const widget = `
import { defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = () => props.price * quantity.value;
    return tags.button(
      { onclick: () => emit('add', { total: total() }) },
      () => \`Add \${quantity.value} for \${total()}\`,
    );
  },
  { attributes: { price: 0 } },
);
`;

const embed = `
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49"></price-widget>
`;

const badges = [
  [
    'https://img.shields.io/npm/v/ecmact?logo=npm&color=CB3837&label=npm',
    'npm version',
    external.npm,
  ],
  ['https://img.shields.io/npm/dm/ecmact?logo=npm&color=CB3837', 'npm downloads', external.npm],
  [
    'https://img.shields.io/github/actions/workflow/status/eternalvision/ecmact/ci.yml?branch=main&logo=github&label=CI',
    'CI status',
    `${external.github}/actions`,
  ],
  ['https://img.shields.io/npm/l/ecmact', 'MIT license', `${external.github}/blob/main/LICENSE`],
] as const;

/**
 * Shows the command that creates a project, with a button that copies it.
 *
 * @returns The element.
 */
const installLine = () =>
  div(
    { class: 'install' },
    code(span({ class: 'prompt' }, '$'), ` ${install}`),
    copyButton(install, 'code-copy', m().installName),
  );

/**
 * The example beside the promise: the entry file, the running result under it labeled as sample data and the markup
 * the file needs. The displayed source is checked against the running example by its test.
 *
 * @returns The element.
 */
const example = () =>
  div(
    { class: 'try', role: 'group', 'aria-label': m().exampleLabel },
    CodeBlock({ code: source, language: 'ts', title: entryName }),
    div({ class: 'preview', role: 'group', 'aria-label': m().exampleResult }, create()),
    p({ class: 'try-sample' }, m().exampleSample),
  );

/**
 * The hero: the promise, the entry points and the install command beside a runnable example.
 *
 * @param router - The router.
 * @returns The section.
 */
const hero = (router: Router) =>
  section(
    { class: 'hero intro wrap' },
    div(
      { class: 'hero-copy' },
      h1(m().heroTitle),
      p({ class: 'lead' }, m().lead),
      div(
        { class: 'actions' },
        router.link({ to: '/docs/getting-started', class: 'button' }, m().start),
        outside(external.github, 'GitHub'),
      ),
      installLine(),
    ),
    example(),
  );

/**
 * The three steps from an element to an embedded widget, each with a plain link where one helps.
 *
 * @param router - The router.
 * @returns The element.
 */
const flow = (router: Router) => {
  const links = [
    undefined,
    router.link({ to: '/examples' }, m().live),
    router.link({ to: '/docs/widgets' }, m().widgetGuide),
  ];
  return div(
    { class: 'flow wrap', role: 'group', 'aria-label': m().flowLabel },
    m().flow.map(([title, note], index) =>
      div(strong(title), p(parseInline(note)), links[index] ? p(links[index]) : undefined),
    ),
  );
};

/**
 * The strip that says how to run the example in a starter: where to paste it and the markup the starter already has.
 *
 * @returns The element.
 */
const starter = () =>
  div(
    { class: 'starter wrap' },
    div(strong(m().starterTitle), p(m().starterNote)),
    CodeBlock({ code: markup, language: 'html', title: markupName }),
  );

/**
 * The badges of the project, below the first screen.
 *
 * @returns The element.
 */
const badgeRow = () =>
  div(
    { class: 'badges wrap', role: 'group', 'aria-label': m().badgesLabel },
    badges.map(([src, alt, href]) =>
      a({ href, target: '_blank', rel: 'noreferrer' }, img({ src, alt, height: 20 })),
    ),
  );

/**
 * A row of facts that a visitor weighs first.
 *
 * @returns The section.
 */
const facts = () =>
  section(
    { class: 'facts wrap', 'aria-label': m().factsLabel },
    m().facts.map(([value, label]) => div({ class: 'fact' }, strong(value), span(label))),
  );

/**
 * The grid of what the library offers, each card leading to its documentation.
 *
 * @param router - The router.
 * @returns The section.
 */
const featureGrid = (router: Router) =>
  section(
    { class: 'wrap section', id: 'features' },
    h2(m().featuresTitle),
    p({ class: 'section-lead' }, m().featuresLead),
    div(
      { class: 'cards' },
      featuresFor(currentLocale()).map((feature) =>
        router.link(
          { to: `/docs/${feature.page}`, class: 'card' },
          span({ class: 'card-icon' }, icon(feature.icon)),
          h3(feature.title),
          p(feature.text),
        ),
      ),
    ),
  );

/**
 * Two live demos side by side, so that the page proves something at once.
 *
 * @returns The section.
 */
const live = () =>
  section(
    { class: 'wrap section' },
    h2(m().liveTitle),
    p({ class: 'section-lead' }, m().liveLead),
    div(
      { class: 'demo-grid' },
      ['exposure', 'typecase']
        .map((id) => findDemo(id))
        .filter((demo) => demo !== undefined)
        .map((demo) => DemoFrame(demo)),
    ),
  );

/**
 * The section about embedding: the widget, and the two lines that put it on any page.
 *
 * @param router - The router.
 * @returns The section.
 */
const embedding = (router: Router) =>
  section(
    { class: 'wrap section split' },
    div(
      { class: 'split-text' },
      h2(m().embedTitle),
      p(m().embedText),
      ul(
        { class: 'ticks' },
        m().embedTicks.map((tick) => li(tick)),
      ),
      p(
        { class: 'actions' },
        router.link({ to: '/widgets', class: 'button' }, m().embedGallery),
        outside(`${external.widget}embed.html`, m().embedForeign, 'button ghost'),
        router.link({ to: '/docs/widgets', class: 'button ghost' }, m().embedGuide),
      ),
    ),
    div(
      { class: 'split-code' },
      CodeBlock({ code: widget.trim(), language: 'ts', title: 'widget.ts' }),
      CodeBlock({ code: embed.trim(), language: 'html', title: 'any page' }),
    ),
  );

/**
 * What the library is for, as a grid of use cases.
 *
 * @returns The section.
 */
const uses = () =>
  section(
    { class: 'wrap section' },
    h2(m().usesTitle),
    div(
      { class: 'uses' },
      useCasesFor(currentLocale()).map((use) => div({ class: 'use' }, h3(use.title), p(use.text))),
    ),
  );

/**
 * One piece of code that shows that routing, state and data fit together.
 *
 * @returns The section.
 */
const whole = () =>
  section(
    { class: 'wrap section' },
    h2(m().wholeTitle),
    p({ class: 'section-lead' }, m().wholeLead),
    CodeBlock({ code: app.trim(), language: 'ts', title: 'main.ts' }),
  );

/**
 * The closing call to action.
 *
 * @param router - The router.
 * @returns The section.
 */
const closing = (router: Router) =>
  section(
    { class: 'wrap section closing' },
    h2(m().closingTitle),
    installLine(),
    p(
      { class: 'actions' },
      router.link({ to: '/docs/getting-started', class: 'button' }, m().guide),
      outside(external.starter, m().tryStarter, 'button ghost'),
    ),
  );

/**
 * The home page of the site.
 *
 * @param router - The router.
 * @returns The page.
 */
export const home = (router: Router) =>
  main(
    { class: 'home' },
    hero(router),
    flow(router),
    starter(),
    badgeRow(),
    facts(),
    featureGrid(router),
    live(),
    embedding(router),
    whole(),
    uses(),
    closing(router),
  );
