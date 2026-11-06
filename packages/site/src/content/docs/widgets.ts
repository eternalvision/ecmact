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
      '`defineWidget` registers a custom element that renders an ECMact component tree. The page that embeds it needs no framework and no build step: a script tag and the element are enough. This is what ECMact is best at.',
    ),
    p(
      'Try it: the [widget demo](https://eternalvision.github.io/ecmact/widget/) and a [page that is not ours](https://eternalvision.github.io/ecmact/widget/embed.html), which loads the built script with one tag and keeps its own fonts and colors. The [widget gallery](/widgets) embeds five widgets into four unrelated sites with hostile CSS of their own.',
    ),
    code(
      'ts',
      `
import { computed, defineWidget, signal, tags } from 'ecmact';

defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = computed(() => Number(props.price.value ?? 0) * quantity.value);
    return tags.button({
      content: computed(() => \`Add \${quantity.value} for \${total.value}\`),
      onclick: () => emit('add', { quantity: quantity.value, total: total.value }),
    });
  },
  { attributes: ['price'] },
);
`,
      'src/widget.ts',
    ),
    code(
      'html',
      `
<script src="https://example.com/price-widget.js"></script>
<price-widget price="49"></price-widget>

<script>
  document.addEventListener('add', (event) => console.log(event.detail));
</script>
`,
      'the page that embeds it',
    ),
    h2('The contract'),
    table(
      ['Part', 'Description'],
      ['`host`', 'The custom element itself.'],
      ['`props`', 'The observed attributes as signals: the value, or `null` while absent.'],
      [
        '`emit(type, detail?)`',
        'Dispatches a `CustomEvent` that bubbles and crosses the shadow boundary.',
      ],
      [
        '`attributes`',
        'The attributes to follow. `setAttribute` on the page updates the matching signal.',
      ],
      ['`shadow`', 'Render into a Shadow DOM. Defaults to `true`.'],
    ),
    ul(
      '**Settings go in as attributes**, and attributes are strings. Convert them in a `computed` and keep the defaults there.',
      '**Results come out as events.** A listener on the host, on `document` or anywhere between hears them.',
      '**The look is set from outside with CSS custom properties**, which inherit into a Shadow DOM: `price-widget { --widget-accent: red }`.',
      '**Styles are isolated both ways.** For one stylesheet covering the widget, return a fragment with a `<style>` element and render the inner components with `shadow: false`.',
      'Each instance has its own signals. Define a name once: defining it twice throws.',
    ),
    h3('Building the script'),
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
