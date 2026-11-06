import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The router: routes, outlet, links, nested routes, guards and lazy views. */
export const page: DocPage = {
  slug: 'routing',
  title: 'Routing',
  summary: 'History API routing with an outlet, links, nested routes, guards and lazy views.',
  group: 'Application',
  blocks: [
    p(
      '`createRouter` maps URLs to views using the History API. The location is a signal, so everything built on signals can follow it. The router is tree-shakeable: it is not in your bundle unless you import it.',
    ),
    code(
      'ts',
      `
import { createRouter, mount, tags } from 'ecmact';

const router = createRouter({
  routes: [
    { path: '/', view: () => tags.h1({ content: 'Home' }) },
    { path: '/users/:id', view: ({ params }) => tags.h1({ content: \`User \${params.id}\` }) },
    { path: '/files/*', view: ({ params }) => tags.p({ content: params['*'] }) },
  ],
  notFound: () => tags.h1({ content: 'Not found' }),
});

mount(
  '#app',
  tags.nav({ children: [router.link({ to: '/', content: 'Home' }), router.link({ to: '/users/1', content: 'User 1' })] }),
  router.outlet(),
);
`,
    ),
    h2('Routes'),
    table(
      ['Pattern', 'Matches', '`params`'],
      ['`/`', 'The root', '`{}`'],
      ['`/users/:id`', '`/users/42`, one segment per parameter, decoded', "`{ id: '42' }`"],
      ['`/files/*`', '`/files` and everything below it', "`{ '*': 'a/b.txt' }`"],
      ['`*`', 'Any path, as a catch-all', "`{ '*': 'a/b' }`"],
    ),
    p(
      'The first matching route wins. A `view` receives `path`, `params`, `query` (a `URLSearchParams`), `hash` and the `router`, and returns a node or a promise of one. A promise is how code splitting works: the outlet stays empty until it resolves, and a late result is dropped if the route changed.',
    ),
    code(
      'ts',
      "{ path: '/settings', view: async () => (await import('./settings')).settingsView() }",
    ),
    h2('Links and navigation'),
    ul(
      '`router.link({ to, content })` returns an anchor with a real `href`, so middle click and copy link work. A plain left click navigates without a page load; modifier keys, other buttons, `target` and other origins are left to the browser.',
      '`router.navigate(to, { replace, scroll })` returns a promise of whether the navigation happened. Without async guards the location is already updated when it returns.',
      'The link gets `aria-current="page"` while its path is the current one.',
      '`base` serves the app from a sub-path: `createRouter({ base: "/ecmact", routes })`. This site does exactly that on GitHub Pages.',
    ),
    h2('Nested routes'),
    p(
      "A route with `children` is a layout. Its path is a prefix, the children's paths are relative, and the layout never matches alone: use a child with an empty path as the index. The layout's view places the child with `router.outlet()`.",
    ),
    code(
      'ts',
      `
const router = createRouter({
  routes: [
    {
      path: '/users',
      view: () => tags.section({ children: [tags.h1({ content: 'Users' }), router.outlet()] }),
      children: [
        { path: '', view: () => tags.p({ content: 'Pick a user' }) },
        { path: ':id', view: ({ params }) => tags.p({ content: \`User \${params.id}\` }) },
      ],
    },
  ],
});
`,
    ),
    p(
      'A layout is kept while only its child changes, and rebuilt when the route outside it changes or a parameter in its own part of the path does.',
    ),
    h2('Guards'),
    p(
      'A guard runs before a navigation commits. It receives where the navigation goes and where it comes from, and returns `true` or nothing to proceed, `false` to cancel, or a path to redirect there. It may be asynchronous.',
    ),
    code(
      'ts',
      `
const router = createRouter({
  beforeEach: (to) => (to.path.startsWith('/admin') && !session.value ? '/login' : true),
  routes: [
    { path: '/admin', view: adminView, beforeEnter: async () => (await can('admin')) || '/' },
    { path: '/login', view: loginView },
  ],
});

if (await router.navigate('/admin')) console.log('navigated');
`,
    ),
    ul(
      '`beforeEach` runs first, then the `beforeEnter` of every route in the chain, outermost first.',
      'Guards also run for the first location and for back and forward. A guard that cancels on back puts the old URL back; one that redirects replaces the entry.',
      'More than ten redirects in a row throw an error.',
    ),
    callout(
      'warning',
      'Guards are a user-interface convenience, not security: the client can always bypass them. Check permissions on the server.',
    ),
    callout(
      'note',
      'Only history mode is supported, so the server must answer unknown paths with `index.html` (the default of Vite and of most hosts with an SPA fallback). There are no transitions and no scroll restoration.',
    ),
  ],
};
