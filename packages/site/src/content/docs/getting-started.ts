import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Install, scaffold and write the first component. */
export const page: DocPage = {
  slug: 'getting-started',
  title: 'Getting started',
  summary: 'Install ECMact, scaffold a project and write your first component in a few minutes.',
  group: 'Start',
  blocks: [
    p(
      'ECMact is a small library for reactive interfaces on native Web Components. A component is a function call that returns a real DOM element: there is no virtual DOM, no template language and no build step that the library depends on.',
    ),
    h2('Create a project'),
    p(
      'The fastest way is the scaffolder. It writes a Vite and TypeScript project with Prettier and ESLint configured, a test, and a small welcome page.',
    ),
    code(
      'bash',
      `
npm create ecmact@latest my-app
cd my-app
npm install
npm run dev
`,
    ),
    p(
      'The same works with `pnpm create ecmact`, `yarn create ecmact` and `bun create ecmact`. The scaffolder has two templates: an **app** (the default) and a **widget**, a custom element that you can embed into any page.',
    ),
    code('bash', 'npm create ecmact@latest my-widget -- --template widget'),
    h2('Add it to an existing project'),
    code('bash', 'npm install ecmact'),
    p(
      'The package ships ES and CommonJS builds and its own type declarations. It has no runtime dependencies and is marked `sideEffects: false`, so what you do not import is not bundled.',
    ),
    h2('Your first component'),
    code(
      'ts',
      `
import { em, mount } from 'ecmact';

const hello = em.Hello({
  tag: 'h1',
  content: 'Hello, ECMact',
  style: { color: '#1665e0' },
});

mount('#app', hello);
`,
      'src/main.ts',
    ),
    p(
      '`em.Hello(props)` creates a custom element `<em-hello>`. It renders one inner element, here an `h1`, into an open Shadow DOM. Every prop that the library does not use itself becomes an attribute of the inner element.',
    ),
    h2('What you get'),
    table(
      ['Capability', 'Where to read'],
      ['Components, props, children, events and refs', '[Components](/docs/components)'],
      ['Signals, computed values and effects', '[Signals](/docs/signals)'],
      ['Scoped styles, shared stylesheets and Tailwind CSS', '[Styling](/docs/styling)'],
      ['CSS in tagged templates with themes and animations', '[Styled components](/docs/styled)'],
      ['Lifecycle hooks and error handling', '[Lifecycle](/docs/lifecycle)'],
      ['Forms that work across the Shadow DOM boundary', '[Forms](/docs/forms)'],
      ['A router with nested routes and guards', '[Routing](/docs/routing)'],
      ['A store with persistence and DevTools', '[State management](/docs/state)'],
      ['An HTTP client with interceptors and retries', '[HTTP client](/docs/http)'],
      ['Custom elements for embedding in other sites', '[Widgets](/docs/widgets)'],
    ),
    callout(
      'tip',
      'Every example in these docs that has a **Run** panel is a live ECMact component. Open the [examples](/examples) to try them all.',
    ),
    h2('Requirements'),
    ul(
      'Any evergreen browser with Custom Elements v1 and Shadow DOM. No polyfills are included.',
      'Node.js 20.19 or newer for the scaffolder; 22 or newer if you contribute to the library.',
      'TypeScript is optional, but the types are the best documentation: props, attributes and events are typed per tag.',
    ),
  ],
};
