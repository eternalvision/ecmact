import { callout, code, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Inline styles, classes, scoped stylesheets, shared stylesheets and Tailwind CSS. */
export const page: DocPage = {
  slug: 'styling',
  title: 'Styling',
  summary:
    'The style and class props, the css of a component, shared stylesheets and Tailwind CSS.',
  group: 'Core',
  blocks: [
    p(
      'An element made with `tags` is an ordinary element of the page, so the CSS of the page styles it. On top of that there are the `style` and `class` props, a scoped stylesheet for every `em` component, and [styled components](/docs/styled).',
    ),
    h2('The style prop'),
    p(
      '`style` takes an object with camelCase keys. A number is a length in pixels, so `{ width: 240 }` is `240px`. Properties that take plain numbers, such as `opacity`, `zIndex`, `flex`, `flexGrow`, `lineHeight`, `fontWeight`, `order` and `aspectRatio`, keep the number as it is. `false`, `null` and `undefined` remove a property.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { div, input } = tags;

const size = signal(120);

mount(
  '#app',
  input({ type: 'range', min: 40, max: 240, bind: size }),
  div({
    style: {
      width: size,
      height: () => size.value / 2,
      borderRadius: 12,
      opacity: 0.9,
      background: 'teal',
    },
  }),
);
`,
    ),
    p(
      'Each value may be a signal or a function, and then only that property is rewritten. The whole object may be a signal or a function too.',
    ),
    callout(
      'note',
      'A custom property such as `"--gap"` works as a key too, and a number stays a plain number there.',
    ),
    h2('The class prop'),
    p(
      '`class` takes text, a list, or an object whose keys are class names and whose values switch them on. Empty items of a list are left out. Signals and functions may stand anywhere in it.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { li, ul } = tags;

const done = signal(false);
const urgent = true;

mount(
  '#app',
  ul(
    li({ class: 'todo' }, 'Plain text'),
    li({ class: ['todo', urgent && 'urgent'] }, 'A list'),
    li(
      { class: ['todo', { done }], onclick: () => (done.value = !done.value) },
      'An object of switches inside a list',
    ),
    li({ class: () => (done.value ? 'todo done' : 'todo') }, 'A function'),
  ),
);
`,
    ),
    h2('The css of a component'),
    p(
      'A component made with `em` keeps its children in a shadow root. The CSS of the page does not reach inside, and the styles of the component do not leak out. The `css` prop is the stylesheet of that shadow root: its selectors match the children directly, and `:host` is the component itself. It may be a signal or a function.',
    ),
    code(
      'ts',
      `
import { em, mount, tags } from 'ecmact';

const { button } = tags;

const toolbar = em.Toolbar(
  {
    css: \`
      :host { display: flex; gap: 8px; }
      button {
        padding: 8px 16px;
        border-radius: 10px;
        background: var(--accent, #1665e0);
        color: white;
      }
      button:hover { filter: brightness(1.1); }
    \`,
  },
  button('Save'),
  button('Cancel'),
);

mount('#app', toolbar);
`,
    ),
    p(
      'The stylesheet is a constructable stylesheet where the browser has them and a `<style>` element otherwise.',
    ),
    h2('Shared stylesheets'),
    p(
      'Styles that every component needs, such as a reset, go into `configure({ styles })`. Strings are turned into one sheet that the shadow roots of all components and [widgets](/docs/widgets) share. Sheets can also be `CSSStyleSheet` objects. Call `configure` before the first component is created.',
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
      'CSS custom properties inherit into a shadow root. That makes them the theming mechanism: a component reads `var(--accent, #1665e0)` and the page sets `--accent` on any ancestor. This is how [widgets](/docs/widgets) are themed from outside.',
    ),
    h2('Tailwind CSS'),
    p(
      'Elements made with `tags` in the page take Tailwind utilities as any other markup does. Inside a shadow root the utilities do nothing, because the CSS of the page does not reach there. There are two ways to use them in components:',
    ),
    ul(
      '**Light DOM.** Create components with `shadow: false`, or call `configure({ shadow: false })`, and load Tailwind in the page as usual.',
      '**Shared stylesheet.** Build Tailwind to a CSS file and pass it as a shared stylesheet. Utilities, theme values and variants then work inside every shadow root.',
    ),
    code(
      'ts',
      `
import { configure, em, tags } from 'ecmact';
import tailwind from './tailwind.out.css?inline';

const { button } = tags;

configure({ styles: [tailwind] });

const actions = em.Actions(
  button({ class: 'rounded-lg bg-red-500 px-4 py-2 text-white md:px-8' }, 'Delete'),
);
`,
    ),
    callout(
      'note',
      'Tailwind 4 registers custom properties with `@property`, which browsers only honor in the document. ECMact copies the `@property` rules of a shared stylesheet into the document once, so `border`, `shadow-*`, `ring-*` and transforms work.',
    ),
    h2('Light DOM'),
    p(
      '`shadow: false` renders the children into the component itself. The CSS of the page applies, and labels and ids work across components. The hooks still run. The `css` prop is ignored without a shadow root, with a warning. The choice is made when the component is created and cannot be changed afterwards.',
    ),
    code(
      'ts',
      `
import { configure, em, tags } from 'ecmact';

const { p } = tags;

configure({ shadow: false });

const plain = em.Notice(p('Styled by the page'));
const isolated = em.Notice({ shadow: true, css: 'p { color: teal; }' }, p('Styled by itself'));
`,
    ),
  ],
};
