import { tags, type Router } from 'ecmact';
import { featuresFor, useCasesFor } from '@site/content/features';
import { text } from '@site/content/messages';
import { findDemo } from '@site/demos/index';
import { icon } from '@site/lib/dom';
import { currentLocale } from '@site/lib/i18n';
import { withBase } from '@site/lib/paths';
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
    copyButton(install, 'code-copy'),
  );

/**
 * The hero: logo, promise, install command, calls to action and badges.
 *
 * @param router - The router.
 * @returns The section.
 */
const hero = (router: Router) =>
  section(
    { class: 'hero wrap' },
    img({
      class: 'hero-logo',
      src: withBase('/ecmact-logo.png'),
      alt: 'ECMact',
      width: 856,
      height: 283,
    }),
    h1(m().heroTitle, span({ class: 'accent' }, m().heroAccent)),
    p({ class: 'lead' }, m().lead),
    installLine(),
    div(
      { class: 'actions' },
      router.link({ to: '/docs/getting-started', class: 'button' }, m().start),
      router.link({ to: '/examples', class: 'button ghost' }, m().live),
      outside(external.github, 'GitHub', 'button ghost'),
      outside(external.npm, 'npm', 'button ghost'),
    ),
    p(
      { class: 'badges' },
      badges.map(([src, alt, href]) =>
        a({ href, target: '_blank', rel: 'noreferrer' }, img({ src, alt, height: 20 })),
      ),
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
      ['counter', 'styled']
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
    facts(),
    featureGrid(router),
    live(),
    embedding(router),
    whole(),
    uses(),
    closing(router),
  );
