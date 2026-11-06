import type { Router } from 'ecmact';
import { featuresFor, useCasesFor } from '@site/content/features';
import { text } from '@site/content/messages';
import { findDemo } from '@site/demos/index';
import { link } from '@site/lib/component';
import { el, icon } from '@site/lib/dom';
import { currentLocale } from '@site/lib/i18n';
import { followInternalLinks } from '@site/lib/links';
import { withBase } from '@site/lib/paths';
import { CodeBlock } from '@site/ui/codeBlock';
import { copyButton } from '@site/ui/copyButton';
import { DemoFrame } from '@site/ui/demoFrame';
import { external, outside } from '@site/ui/header';

const install = 'npm create ecmact@latest my-app';

/**
 * Reads the texts of the home page in the language in use.
 *
 * @returns The texts.
 */
const m = () => text().home;

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
    el('h1', {}, m().heroTitle, el('span', { class: 'accent' }, m().heroAccent)),
    el('p', { class: 'lead' }, m().lead),
    el(
      'div',
      { class: 'install' },
      el('code', {}, el('span', { class: 'prompt' }, '$'), ` ${install}`),
      copyButton(install, 'code-copy'),
    ),
    el(
      'div',
      { class: 'actions' },
      action(router, '/docs/getting-started', m().start, 'button'),
      action(router, '/examples', m().live, 'button ghost'),
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
    ...m().facts.map(([value, label]) =>
      el('div', { class: 'fact' }, el('strong', {}, value), el('span', {}, label)),
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
    el('h2', {}, m().featuresTitle),
    el('p', { class: 'section-lead' }, m().featuresLead),
    el(
      'div',
      { class: 'cards' },
      ...featuresFor(currentLocale()).map((feature) =>
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
    el('h2', {}, m().liveTitle),
    el('p', { class: 'section-lead' }, m().liveLead),
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
      el('h2', {}, m().embedTitle),
      el('p', {}, m().embedText),
      el('ul', { class: 'ticks' }, ...m().embedTicks.map((tick) => el('li', {}, tick))),
      el(
        'p',
        { class: 'actions' },
        outside(external.widget, m().embedDemo, 'button'),
        outside(`${external.widget}embed.html`, m().embedForeign, 'button ghost'),
        action(router, '/docs/widgets', m().embedGuide, 'button ghost'),
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
    el('h2', {}, m().usesTitle),
    el(
      'div',
      { class: 'uses' },
      ...useCasesFor(currentLocale()).map((use) =>
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
    el('h2', {}, m().wholeTitle),
    el('p', { class: 'section-lead' }, m().wholeLead),
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
    el('h2', {}, m().closingTitle),
    el(
      'div',
      { class: 'install' },
      el('code', {}, el('span', { class: 'prompt' }, '$'), ` ${install}`),
      copyButton(install, 'code-copy'),
    ),
    el(
      'p',
      { class: 'actions' },
      action(router, '/docs/getting-started', m().guide, 'button'),
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
