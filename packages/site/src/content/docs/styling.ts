import { callout, code, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Scoped styles, shared stylesheets, Tailwind CSS and the Shadow DOM trade-offs. */
export const page: DocPage = {
  slug: 'styling',
  title: 'Styling',
  summary: 'The css prop, shared stylesheets, Tailwind CSS, custom properties and light DOM.',
  group: 'Core',
  blocks: [
    p(
      "Components render into a Shadow DOM by default. Global CSS does not reach inside, and the component's styles do not leak out. That isolation is the point, and ECMact gives you several ways to style within it.",
    ),
    h2('The css prop'),
    p(
      "`css` takes stylesheet text that is scoped to the component's shadow root. It uses constructable stylesheets where the browser has them and falls back to a `<style>` element. It may be a signal.",
    ),
    code(
      'ts',
      `
tags.button({
  content: 'Save',
  css: \`
    button {
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      background: var(--accent, #1665e0);
      color: white;
    }
    button:hover { filter: brightness(1.1); }
  \`,
});
`,
    ),
    h2('Shared stylesheets'),
    p(
      'Styles that every component needs, such as a reset, go into `configure({ styles })`. Strings are turned into one sheet that all shadow roots share. Sheets can also be `CSSStyleSheet` objects.',
    ),
    code(
      'ts',
      `
import { configure } from 'ecmact';
import reset from './reset.css?inline';

configure({ styles: [reset] });
`,
    ),
    h2('Custom properties cross the boundary'),
    p(
      'CSS custom properties inherit into a shadow root. That makes them the theming mechanism: components read `var(--accent, #1665e0)` and the page sets `--accent` on any ancestor. This is how the [widgets](/docs/widgets) are themed from outside.',
    ),
    h2('Tailwind CSS'),
    p(
      'Global CSS does not reach a shadow root, so Tailwind utilities do nothing inside components by default. There are two ways to use it:',
    ),
    ul(
      '**Light DOM.** Render components with `shadow: false` (or `configure({ shadow: false })`) and load Tailwind in the page as usual.',
      '**Shared stylesheet.** Build Tailwind to a CSS file and pass it as a shared stylesheet. Utilities, theme values and variants then work inside every shadow root.',
    ),
    code(
      'ts',
      `
import { configure, tags } from 'ecmact';
import tailwind from './tailwind.out.css?inline';

configure({ styles: [tailwind] });

tags.button({ class: 'rounded-lg bg-red-500 px-4 py-2 text-white md:px-8', content: 'Delete' });
`,
    ),
    callout(
      'note',
      'Tailwind 4 registers custom properties with `@property`, which browsers only honor in the document. ECMact copies the `@property` rules of a shared stylesheet into `document.head` once, so `border`, `shadow-*`, `ring-*` and transforms work.',
    ),
    h2('Light DOM'),
    p(
      '`shadow: false` renders into the component itself. Global CSS applies, labels and ids work across components, and forms behave natively. The choice is made on the first render. Styles from the `css` prop are ignored without a shadow root, with a warning.',
    ),
    code(
      'ts',
      `
import { configure } from 'ecmact';

configure({ shadow: false });
`,
    ),
    p(
      'This site is built that way: its own interface renders into the light DOM, so that one global stylesheet styles it, and the live demos use the default Shadow DOM with a `css` prop on the root component, whose children render into the light DOM (`shadow: false`) of that shadow root.',
    ),
  ],
};
