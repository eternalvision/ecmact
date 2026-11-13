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

const { h1, nav, p } = tags;

const router = createRouter({
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/users/:id', view: ({ params }) => h1(\`User \${params.id}\`) },
    { path: '/files/*', view: ({ params }) => p(params['*']) },
  ],
  notFound: () => h1('Not found'),
});

mount(
  '#app',
  nav(router.link({ to: '/' }, 'Home'), ' ', router.link({ to: '/users/1' }, 'User 1')),
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
      'The first matching route wins. A `view` receives `path`, `params`, `query` (a `URLSearchParams`), `hash` and the `router`, and returns a node or a promise of one. A promise is how code splitting works: the outlet stays as it is until the promise resolves, and a late result is dropped if the route changed.',
    ),
    code(
      'ts',
      `
import { createRouter, tags } from 'ecmact';

const { h1 } = tags;

const router = createRouter({
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/settings', view: async () => (await import('./settings')).settingsView() },
  ],
});
`,
    ),
    h2('The outlet, links and navigation'),
    ul(
      '`router.outlet(props?)` returns a `<router-outlet>` component that shows the view of the current route. It renders into the light DOM, so the CSS of the page styles the views.',
      '`router.link({ to, replace?, ...props }, ...children)` returns a real `<a>` with an `href`, so middle click and copy link work. A plain left click navigates without a page load. Modifier keys, other buttons, `target`, `download` and other origins are left to the browser.',
      'The link gets `aria-current="page"` while its path is the current one.',
      '`router.navigate(to, { replace, scroll })` returns a promise of whether the navigation happened. Without async guards the location is already updated when it returns. It scrolls to the top unless `scroll` is `false`.',
      '`router.back()` and `router.forward()` move through the history. `router.dispose()` stops listening to it.',
      '`router.location` and `router.match` are signals: the current path, query and hash, and the route that matches.',
      '`base` serves the app from a sub-path: `createRouter({ base: "/app", routes })`.',
    ),
    code(
      'ts',
      `
import { createRouter, mount, tags } from 'ecmact';

const { h1, p } = tags;

const router = createRouter({
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/search', view: ({ query }) => h1(\`Results for \${query.get('q') ?? ''}\`) },
  ],
});

mount(
  '#app',
  p(() => \`You are at \${router.location.value.path}\`),
  router.outlet({ class: 'view' }),
);

await router.navigate('/search?q=signals');
`,
    ),
    h2('Nested routes'),
    p(
      "A route with `children` is a layout. Its path is a prefix, the children's paths are relative, and the layout never matches alone: use a child with an empty path as the index. The layout's view places the child with `router.outlet()`.",
    ),
    code(
      'ts',
      `
import { createRouter, mount, tags } from 'ecmact';

const { h1, p, section } = tags;

const router = createRouter({
  routes: [
    {
      path: '/users',
      view: () => section(h1('Users'), router.outlet()),
      children: [
        { path: '', view: () => p('Pick a user') },
        { path: ':id', view: ({ params }) => p(\`User \${params.id}\`) },
      ],
    },
  ],
});

mount('#app', router.outlet());
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
import { createRouter, signal, tags } from 'ecmact';

const { h1 } = tags;

const session = signal<{ admin: boolean } | null>(null);

const router = createRouter({
  beforeEach: (to) => (to.path.startsWith('/admin') && !session.value ? '/login' : true),
  routes: [
    { path: '/', view: () => h1('Home') },
    { path: '/admin', view: () => h1('Admin'), beforeEnter: () => session.value?.admin || '/' },
    { path: '/login', view: () => h1('Sign in') },
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
      'Only history mode is supported, so the server must answer unknown paths with `index.html` (the default of Vite and of most hosts with an SPA fallback). There are no transitions, no scroll restoration and no route-level data loading.',
    ),
  ],
};
