import { callout, code, h2, h3, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** defineWidget and the widget template: embedding in pages you do not control. */
export const page: DocPage = {
  slug: 'widgets',
  title: 'Embedding as a widget',
  summary: 'Ship an interface as a custom element that any page can use with one script tag.',
  group: 'Delivery',
  blocks: [
    p(
      '`defineWidget` registers a custom element that renders ECMact elements. The page that embeds it needs no framework and no build step: a script tag and the element are enough. This is what ECMact is best at.',
    ),
    p(
      'Try it: the [widget demo](https://eternalvision.github.io/ecmact/widget/) and a [page that is not ours](https://eternalvision.github.io/ecmact/widget/embed.html), which loads the built script with one tag and keeps its own fonts and colors. The [widget gallery](/widgets) embeds widgets into unrelated sites with hostile CSS of their own.',
    ),
    code(
      'ts',
      `
import { defineWidget, signal, tags } from 'ecmact';

const { button, input } = tags;

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = () => props.price * quantity.value;
    return [
      input({ type: 'number', min: 1, bind: quantity }),
      button(
        { disabled: () => props.soldOut, onclick: () => emit('add', { total: total() }) },
        () => \`Add \${props.label} for \${total()}\`,
      ),
    ];
  },
  {
    attributes: { price: 0, label: 'Product', soldOut: false },
    css: \`
      :host { display: inline-flex; gap: 8px; }
      button { font: inherit; background: var(--widget-accent, #1665e0); color: white; }
    \`,
  },
);
`,
      'src/widget.ts',
    ),
    code(
      'html',
      `
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49" label="Pro plan"></price-widget>

<script>
  document.addEventListener('add', (event) => console.log(event.detail.total));
</script>
`,
      'the page that embeds it',
    ),
    h2('The contract'),
    table(
      ['Part', 'Description'],
      ['`host`', 'The custom element itself.'],
      [
        '`props`',
        'The attributes as plain properties, read without `.value`. Reading one in a reactive function follows the attribute on the page.',
      ],
      [
        '`emit(type, detail?)`',
        'Dispatches a `CustomEvent` that bubbles, crosses the shadow boundary and can be cancelled. Returns `false` if a listener called `preventDefault`.',
      ],
      [
        '`attributes`',
        'The attributes to follow, as an object of defaults. The type of a default decides how the attribute is read.',
      ],
      ['`css`', 'The stylesheet of the shadow root of the widget.'],
      [
        '`shadow`',
        'Render into a Shadow DOM. Defaults to `true`. With `false` the widget renders into the light DOM and `css` is ignored.',
      ],
    ),
    h3('Attributes'),
    table(
      ['Default', 'How the attribute is read'],
      ['A number', 'With `Number`, so `price="49"` is `49`.'],
      ['A boolean', '`true` while the attribute is present. The value `"false"` switches it off.'],
      ['A string', 'As it is.'],
    ),
    ul(
      'While the attribute is absent, the prop is the default.',
      'A camelCase key stands for the attribute in kebab-case: `soldOut` is `sold-out`.',
      '`setAttribute` on the page updates the prop, and the reactive functions that read it run again. Attributes that are not listed are not followed.',
    ),
    h3('How a widget behaves'),
    ul(
      '`render` returns anything a child can be: an element, a list, text. The elements inside are plain `tags` elements, styled by the `css` of the widget.',
      '`render` runs when the element is put into a page. An `effect` or a [resource](/docs/data) created in it stops when the element is taken out, and `render` runs again, from a clean state, if the element is put back. A widget that is only moved keeps its content.',
      '**Results come out as events.** A listener on the host, on `document` or anywhere between hears them.',
      '**The look is set from outside with CSS custom properties**, which inherit into a Shadow DOM: `price-widget { --widget-accent: red }`. Other styles of the page do not reach inside, and the styles of the widget do not leak out.',
      '[Shared stylesheets](/docs/styling) from `configure({ styles })` apply inside a widget too, and [styled components](/docs/styled) put their rules into its shadow root.',
      'Each instance has its own state. Define a name once: defining it twice throws.',
    ),
    h2('Building the script'),
    code(
      'ts',
      `
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: { entry: 'src/widget.ts', formats: ['iife'], name: 'PriceWidget', fileName: () => 'price-widget.js' },
  },
});
`,
      'vite.widget.config.ts',
    ),
    code('bash', 'npm create ecmact@latest my-widget -- --template widget'),
    p(
      'The widget template sets all of this up: a working widget, a demo page, tests, the IIFE build, and the same Prettier and ESLint configuration as the app template.',
    ),
    callout(
      'warning',
      "Treat third-party widget scripts as code that runs with the host page's privileges. Shadow DOM isolates markup and styling; it is not a security sandbox.",
    ),
  ],
};
