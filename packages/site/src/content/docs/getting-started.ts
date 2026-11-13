import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Install, scaffold and write the first elements. */
export const page: DocPage = {
  slug: 'getting-started',
  title: 'Getting started',
  summary: 'Install ECMact, scaffold a project and put your first reactive elements on a page.',
  group: 'Start',
  blocks: [
    p(
      'ECMact is a small library for reactive interfaces on the DOM. You build the page from function calls that return real DOM elements, and signals keep those elements up to date. There is no virtual DOM, no template language and no build step that the library depends on.',
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
    h2('Your first elements'),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { button, h1 } = tags;

const count = signal(0);

mount(
  '#app',
  h1('Hello, ECMact'),
  button({ onclick: () => count.value++ }, () => \`Clicked \${count.value} times\`),
);
`,
      'src/main.ts',
    ),
    ul(
      '`tags.button(...)` returns a real `<button>`. The first argument is the props when it is a plain object. Everything after it is children.',
      'A child that is a function is rendered again when a signal it reads changes. Here only the text of the button is rewritten on a click.',
      '`mount` puts the elements into the page, into the element that the selector finds.',
    ),
    h2('What you get'),
    table(
      ['Capability', 'Where to read'],
      [
        'Elements, props, children, events, lists and components',
        '[Elements and components](/docs/components)',
      ],
      ['Signals, computed values and effects', '[Signals](/docs/signals)'],
      ['Inline styles, classes, scoped stylesheets and Tailwind CSS', '[Styling](/docs/styling)'],
      ['CSS in tagged templates with themes and animations', '[Styled components](/docs/styled)'],
      ['Lifecycle hooks and error handling', '[Lifecycle](/docs/lifecycle)'],
      ['Values handed down the tree', '[Context](/docs/context)'],
      ['Two-way binding and fields inside a Shadow DOM', '[Forms](/docs/forms)'],
      ['A router with nested routes and guards', '[Routing](/docs/routing)'],
      ['A store with persistence and DevTools', '[State management](/docs/state)'],
      ['An HTTP client with interceptors and retries', '[HTTP client](/docs/http)'],
      ['Async data with loading and error states', '[Data fetching](/docs/data)'],
      ['Custom elements for embedding in other sites', '[Widgets](/docs/widgets)'],
    ),
    callout(
      'tip',
      'Every example in these docs that has a **Run** panel is live ECMact code. Open the [examples](/examples) to try them all.',
    ),
    h2('Requirements'),
    ul(
      'Any evergreen browser. Components and widgets use Custom Elements v1 and Shadow DOM, and styled components use native CSS nesting. No polyfills are included.',
      'Node.js 20.19 or newer for the scaffolder.',
      'TypeScript is optional, but the types are the best documentation: props, attributes and events are typed per tag.',
    ),
  ],
};
