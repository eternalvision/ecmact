import type { Router } from 'ecmact';
import { features, useCases } from '@site/content/features';
import { findDemo } from '@site/demos/index';
import { link } from '@site/lib/component';
import { el, icon } from '@site/lib/dom';
import { followInternalLinks } from '@site/lib/links';
import { withBase } from '@site/lib/paths';
import { CodeBlock } from '@site/ui/codeBlock';
import { copyButton } from '@site/ui/copyButton';
import { DemoFrame } from '@site/ui/demoFrame';
import { external, outside } from '@site/ui/header';

const install = 'npm create ecmact@latest my-app';

const app = `
import { computed, createHttp, createRouter, createStore, mount, resource, tags } from 'ecmact';

const api = createHttp({ baseURL: '/api', retry: 2 });
const cart = createStore<{ count: number; add: () => void }>((set) => ({
  count: 0,
  add: () => set((state) => ({ count: state.count + 1 })),
}));

const router = createRouter({
  routes: [
    { path: '/', view: () => tags.h1({ content: 'Shop' }) },
    {
      path: '/products',
      view: () => {
        const products = resource(({ signal }) => api.get('/products', { signal }).then((r) => r.data));
        return tags.p({ content: computed(() => (products.loading.value ? 'Loading...' : 'Loaded')) });
      },
    },
  ],
});

mount(
  '#app',
  tags.button({ content: cart.select((state) => \`Cart (\${state.count})\`), onclick: () => cart.getState().add() }),
  router.outlet(),
);
`;

const widget = `
import { computed, defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = computed(() => Number(props.price.value) * quantity.value);
    return tags.button({
      content: computed(() => \`Add \${quantity.value} for \${total.value}\`),
      onclick: () => emit('add', { total: total.value }),
    });
  },
  { attributes: ['price'] },
);
`;

const embed = `
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49"></price-widget>
`;

/**
 * Builds a link that looks like a button.
 *
 * @param router - The router.
 * @param to - The path.
 * @param label - The text.
 * @param kind - `button` or `button ghost`.
 * @returns The link.
 */
const action = (router: Router, to: string, label: string, kind: string) =>
  link(router, to, label, kind);

/**
 * The hero: logo, promise, install command, calls to action and badges.
 *
 * @param router - The router.
 * @returns The section.
 */
const hero = (router: Router) =>
  el(
    'section',
    { class: 'hero wrap' },
    el('img', {
      class: 'hero-logo',
      attrs: { src: withBase('/ecmact-logo.png'), alt: 'ECMact', width: '856', height: '283' },
    }),
    el(
      'h1',
      {},
      'Reactive interfaces on ',
      el('span', { class: 'accent' }, 'native Web Components'),
    ),
    el(
      'p',
      { class: 'lead' },
      'ECMact is a small library with signals, a router, a store, an HTTP client, styled components and embeddable widgets. No virtual DOM, no dependencies, and nothing that has to be compiled.',
    ),
    el(
      'div',
      { class: 'install' },
      el('code', {}, el('span', { class: 'prompt' }, '$'), ` ${install}`),
      copyButton(install, 'code-copy'),
    ),
    el(
      'div',
      { class: 'actions' },
      action(router, '/docs/getting-started', 'Get started', 'button'),
      action(router, '/examples', 'See live examples', 'button ghost'),
      outside(external.github, 'GitHub', 'button ghost'),
      outside(external.npm, 'npm', 'button ghost'),
    ),
    el(
      'p',
      { class: 'badges' },
      ...[
        [
          'https://img.shields.io/npm/v/ecmact?logo=npm&color=CB3837&label=npm',
          'npm version',
          external.npm,
        ],
        [
          'https://img.shields.io/npm/dm/ecmact?logo=npm&color=CB3837',
          'npm downloads',
          external.npm,
        ],
        [
          'https://img.shields.io/github/actions/workflow/status/eternalvision/ecmact/ci.yml?branch=main&logo=github&label=CI',
          'CI status',
          `${external.github}/actions`,
        ],
        [
          'https://img.shields.io/npm/l/ecmact',
          'MIT license',
          `${external.github}/blob/main/LICENSE`,
        ],
      ].map(([src, alt, href]) =>
        el(
          'a',
          { attrs: { href: href as string, target: '_blank', rel: 'noreferrer' } },
          el('img', { attrs: { src: src as string, alt: alt as string, height: '20' } }),
        ),
      ),
    ),
  );

/**
 * A row of facts that a visitor weighs first.
 *
 * @returns The section.
 */
const facts = () =>
  el(
    'section',
    { class: 'facts wrap', attrs: { 'aria-label': 'Facts' } },
    ...[
      ['0', 'runtime dependencies'],
      ['100%', 'test coverage, every line'],
      ['Shadow DOM', 'isolation by default'],
      ['Typed', 'props, events and attributes per tag'],
    ].map(([value, label]) =>
      el(
        'div',
        { class: 'fact' },
        el('strong', {}, value as string),
        el('span', {}, label as string),
      ),
    ),
  );

/**
 * The grid of what the library offers, each card leading to its documentation.
 *
 * @param router - The router.
 * @returns The section.
 */
const featureGrid = (router: Router) => {
  const section = el(
    'section',
    { class: 'wrap section', attrs: { id: 'features' } },
    el('h2', {}, 'Everything an interface needs, nothing it does not'),
    el(
      'p',
      { class: 'section-lead' },
      'One package covers the pieces that usually come from five. Each one is small, typed and tested.',
    ),
    el(
      'div',
      { class: 'cards' },
      ...features.map((feature) =>
        el(
          'a',
          {
            class: 'card',
            attrs: {
              href: withBase(`/docs/${feature.page}`),
              'data-internal': `/docs/${feature.page}`,
            },
          },
          el('span', { class: 'card-icon' }, icon(feature.icon)),
          el('h3', {}, feature.title),
          el('p', {}, feature.text),
        ),
      ),
    ),
  );
  followInternalLinks(section, router);
  return section;
};

/**
 * Two live demos side by side, so that the page proves something at once.
 *
 * @returns The section.
 */
const live = () => {
  const shown = ['counter', 'styled']
    .map((id) => findDemo(id))
    .filter((demo) => demo !== undefined);
  return el(
    'section',
    { class: 'wrap section' },
    el('h2', {}, 'See it run'),
    el(
      'p',
      { class: 'section-lead' },
      'These are real components, not screenshots. Press the buttons, then read the code.',
    ),
    el('div', { class: 'demo-grid' }, ...shown.map((demo) => DemoFrame(demo))),
  );
};

/**
 * The section about embedding: the widget, and the two lines that put it on any page.
 *
 * @param router - The router.
 * @returns The section.
 */
const embedding = (router: Router) =>
  el(
    'section',
    { class: 'wrap section split' },
    el(
      'div',
      { class: 'split-text' },
      el('h2', {}, 'Built to be embedded'),
      el(
        'p',
        {},
        'Most interfaces live in a page you control. ECMact is made for the ones that do not: a calculator on a partner site, a form in a CMS, a panel in a browser extension.',
      ),
      el(
        'ul',
        { class: 'ticks' },
        el('li', {}, 'One IIFE script, no framework needed on the host page'),
        el('li', {}, 'Shadow DOM keeps your styles and the page apart'),
        el('li', {}, 'Settings come in as attributes, results leave as DOM events'),
        el('li', {}, 'Themed from outside with CSS custom properties'),
      ),
      el(
        'p',
        { class: 'actions' },
        outside(external.widget, 'Open the widget demo', 'button'),
        outside(`${external.widget}embed.html`, 'See it on a foreign page', 'button ghost'),
        action(router, '/docs/widgets', 'Read the guide', 'button ghost'),
      ),
    ),
    el(
      'div',
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
  el(
    'section',
    { class: 'wrap section' },
    el('h2', {}, 'What people build with it'),
    el(
      'div',
      { class: 'uses' },
      ...useCases.map((use) =>
        el('div', { class: 'use' }, el('h3', {}, use.title), el('p', {}, use.text)),
      ),
    ),
  );

/**
 * One piece of code that shows that routing, state and data fit together.
 *
 * @returns The section.
 */
const whole = () =>
  el(
    'section',
    { class: 'wrap section' },
    el('h2', {}, 'A whole app, one import'),
    el(
      'p',
      { class: 'section-lead' },
      'A router, a store and an HTTP client, all from ecmact, all working with the same signals.',
    ),
    CodeBlock({ code: app.trim(), language: 'ts', title: 'main.ts' }),
  );

/**
 * The closing call to action.
 *
 * @param router - The router.
 * @returns The section.
 */
const closing = (router: Router) =>
  el(
    'section',
    { class: 'wrap section closing' },
    el('h2', {}, 'Start in a minute'),
    el(
      'div',
      { class: 'install' },
      el('code', {}, el('span', { class: 'prompt' }, '$'), ` ${install}`),
      copyButton(install, 'code-copy'),
    ),
    el(
      'p',
      { class: 'actions' },
      action(router, '/docs/getting-started', 'Read the guide', 'button'),
      outside(external.starter, 'Try the starter', 'button ghost'),
    ),
  );

/**
 * The home page of the site.
 *
 * @param router - The router.
 * @returns The page.
 */
export const home = (router: Router) =>
  el(
    'main',
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
