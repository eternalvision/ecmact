import { callout, code, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Context: values offered to the elements below. */
export const page: DocPage = {
  slug: 'context',
  title: 'Context',
  summary: 'Offer a value to everything below an element without passing it through every level.',
  group: 'Core',
  blocks: [
    p(
      'Context hands a value to the elements below a provider. Any element can provide, through the `provide` prop, and anything below it can read the value with `use`. It works through a bubbling DOM event, so it needs no registration and crosses the Shadow DOM boundary.',
    ),
    code(
      'ts',
      `
import { createContext, mount, signal, tags, type Signal } from 'ecmact';

const { button, div, p } = tags;

const Accent = createContext<Signal<string>>('accent');

const color = signal('#1665e0');

mount(
  '#app',
  div(
    { provide: Accent.provide(color) },
    p({ style: { color: () => Accent.use()?.value } }, 'I have the accent color'),
    button({ onclick: () => (color.value = '#d6336c') }, 'Change it'),
  ),
);
`,
    ),
    h2('Creating and providing'),
    ul(
      '`createContext<T>(name)` makes a context. The name is for debugging: two contexts with the same name are still different contexts.',
      '`createContext(name, fallback)` makes one with a fallback value. `use` then never returns `undefined`.',
      '`Context.provide(value)` pairs the context with a value. Pass the result, or a list of them, to the `provide` prop of any element.',
      'The nearest provider wins, so a nested one overrides an outer one for its subtree. An element does not receive what it provides itself.',
    ),
    h2('Reading'),
    p(
      'Inside a reactive function, a child or a prop, call `use()` without arguments: the lookup starts from the element that the function belongs to. Anywhere else, pass the node to start from. Without a node and outside a reactive function, `use()` throws.',
    ),
    code(
      'ts',
      `
import { createContext, em, mount, tags } from 'ecmact';

const { p, section } = tags;

const Locale = createContext('locale', 'en');

const panel = em.Panel(
  { mounted: (host) => console.log('mounted with', Locale.use(host)) },
  p(() => \`Locale: \${Locale.use()}\`),
);

mount('#app', section({ provide: Locale.provide('cs') }, panel), p(() => Locale.use()));
`,
    ),
    p(
      'The first paragraph shows `cs`. The last one has no provider above it and shows the fallback, `en`.',
    ),
    callout(
      'note',
      'A reactive function usually runs for the first time before its element is in the tree, so `use()` finds no provider yet and returns the fallback or `undefined`. The function runs again when the element enters the document. That needs the tree to be put into the page with `mount`, see [Mounting](/docs/components).',
    ),
    h2('Reactive values'),
    p(
      'The provided value itself is fixed. To make a context reactive, provide a **signal**, as the first example does: readers follow the signal. [Themes](/docs/styled) work that way.',
    ),
  ],
};
