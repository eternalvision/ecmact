import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The scaffolder, the starters, testing and the build. */
export const page: DocPage = {
  slug: 'tooling',
  title: 'Tooling and testing',
  summary: 'The scaffolder and its templates, Vite, Prettier, ESLint and testing with Vitest.',
  group: 'Delivery',
  blocks: [
    h2('create-ecmact'),
    p(
      '`create-ecmact` writes a project that is ready to work in: Vite, TypeScript, Prettier and ESLint configured in detail, a Vitest test, and a small starter. It installs nothing and does not touch git.',
    ),
    code(
      'bash',
      `
npm create ecmact@latest my-app
npm create ecmact@latest my-app -- --tailwind
npm create ecmact@latest my-widget -- --template widget
`,
    ),
    table(
      ['Option', 'Description'],
      ['`[directory]`', 'Where to create the project. `.` uses the current directory.'],
      ['`-t, --template`', '`app` (default) or `widget`.'],
      ['`--tailwind`, `--no-tailwind`', 'Add Tailwind CSS as a shared stylesheet (app only).'],
      ['`-y, --yes`', 'Use the defaults and ask nothing.'],
      ['`-f, --force`', 'Write into a directory that is not empty.'],
    ),
    p(
      'Try the [app starter](https://eternalvision.github.io/ecmact/starter/) and the [widget starter](https://eternalvision.github.io/ecmact/widget/) in the browser.',
    ),
    h2('What the generated project has'),
    ul(
      '**Scripts:** `dev`, `build`, `preview`, `test`, `typecheck`, `lint`, `format` and `check`, which runs the type check, lint, format check and tests in one go.',
      '**Prettier** with an `.editorconfig` and VS Code settings; **ESLint** with the strict, type-aware `typescript-eslint` rule sets plus rules for correctness, safety (no `innerHTML`) and style.',
      'It works with npm, pnpm, yarn and bun.',
    ),
    h2('Testing'),
    p(
      'A factory returns a real DOM element, so any DOM test environment works. happy-dom is fast and enough for most tests: create the element, put it into the page with `mount`, interact and assert.',
    ),
    code(
      'ts',
      `
import { signal, tags } from 'ecmact';

const { button } = tags;

export const Counter = () => {
  const count = signal(0);
  return button({ onclick: () => count.value++ }, () => \`count is \${count.value}\`);
};
`,
      'src/counter.ts',
    ),
    code(
      'ts',
      `
import { mount } from 'ecmact';
import { afterEach, expect, it } from 'vitest';
import { Counter } from './counter';

afterEach(() => document.body.replaceChildren());

it('counts clicks', () => {
  const counter = Counter();
  mount(document.body, counter);

  counter.click();
  counter.click();

  expect(counter.textContent).toBe('count is 2');
});
`,
      'src/counter.test.ts',
    ),
    ul(
      'Signals update the DOM synchronously, so there is nothing to wait for after a click or a write.',
      'The children of an `em` component are in its `shadowRoot`: `card.shadowRoot.querySelector("h2")`.',
      'Use `mount`, not `append`, so that context lookups and styled components find their place, see [Mounting](/docs/components).',
    ),
    callout(
      'note',
      'DOM emulators do not cover every browser behavior: focus, forms across the Shadow DOM and `ElementInternals` need a real browser. Reproduce such issues in Chromium, Firefox or Safari.',
    ),
    h2('Build'),
    p(
      "Any bundler works because the library is plain ES modules. With Vite, nothing is needed beyond the defaults. The library is not transpiled below Vite's default target, so it uses modern syntax such as class fields and private `#fields`.",
    ),
  ],
};
