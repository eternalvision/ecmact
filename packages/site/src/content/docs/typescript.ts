import { callout, code, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The types: elements and props typed by tag, events, styles, stores and widgets. */
export const page: DocPage = {
  slug: 'typescript',
  title: 'TypeScript',
  summary: 'Elements, attributes and events typed per tag, so most mistakes are compile errors.',
  group: 'Reference',
  blocks: [
    p(
      'The package ships its own declarations. Each factory of `tags` returns the element type of its tag and takes the props of that tag, so there is nothing to annotate in everyday code.',
    ),
    code(
      'ts',
      `
import { tags } from 'ecmact';

const { a, div, input } = tags;

const link = a({ href: '/docs', target: '_blank' }, 'Docs');
const field = input({ type: 'email', oninput: (event) => console.log(event.target) });

console.log(link.href, field.value);

// @ts-expect-error: src is not an attribute of a link
a({ src: 'x.png' });

// @ts-expect-error: "bogus" is not an input type
input({ type: 'bogus' });

// @ts-expect-error: onclik is not an event
div({ onclik: () => {} });
`,
    ),
    p(
      '`link` is an `HTMLAnchorElement` and `field` an `HTMLInputElement`. The last three calls are compile errors.',
    ),
    h2('What is typed'),
    ul(
      '**Attributes by tag.** Global attributes plus `data-*` and `aria-*` apply to every tag. Tag-specific attributes are defined for forms, media, tables, links, dialogs and more. Value types follow HTML: booleans for boolean attributes, numbers for numeric ones, string unions for enumerated ones.',
      '**Reactive values.** Where a prop takes a value it also takes a signal or a function that returns it. That is `Reactive<T>`.',
      '**Events.** `on<event>` props are typed from `HTMLElementEventMap`; the handler receives the right event.',
      '**Styles.** `style` accepts the string-valued properties of `CSSStyleDeclaration`, with `string | number` values.',
      '**`ref`.** It receives the element type of the tag: `HTMLInputElement` for `input`, the component for `em`.',
      '**`bind`.** Only `input`, `select` and `textarea` take it.',
      '**Custom tags.** A name with a hyphen, such as `tags["x-widget"]`, accepts any attribute and returns an `HTMLElement`.',
      '**Components.** Every `em.Name` takes `ComponentProps` and returns a `Component`, which is an `HTMLElement`.',
    ),
    h2('Your own functions'),
    p(
      'A reusable piece of interface is a function that returns an element. Type its arguments with the exported types: `Props<"a">` for the props of a tag and `Child` for children.',
    ),
    code(
      'ts',
      `
import { tags, type Child, type Props } from 'ecmact';

const { a } = tags;

export const ExternalLink = (props: Props<'a'>, ...children: Child[]) =>
  a({ target: '_blank', rel: 'noreferrer', ...props }, ...children);

const link = ExternalLink({ href: 'https://example.com' }, 'Example');
`,
    ),
    h2('Inferred types'),
    ul(
      '**Stores.** `createStore(initial, actions)` infers the fields from the first argument and the actions from the second. When an initial value says too little, annotate it: `{ items: [] as string[] }`. The type of a store is `Store<S, A>`.',
      '**Widgets.** The props of a widget are typed from the defaults in `attributes`: a number default gives a `number` prop.',
      '**Context.** `createContext<T>(name)` gives `use()` the type `T | undefined`. With a fallback, `createContext(name, fallback)`, it is `T`.',
      '**Styled components.** Transient props come from the generic: `styled.button<{ $primary?: boolean }>`.',
      '**HTTP.** `api.get<User[]>(url)` types the body of the response, and `api.resource<User[]>(url)` types `data`.',
    ),
    code(
      'ts',
      `
import { createContext, createStore, type Signal, type Store } from 'ecmact';

const cart = createStore({ items: [] as string[] }, (set) => ({
  add: (item: string) => set((state) => ({ items: [...state.items, item] })),
}));

const sameCart: Store<{ items: string[] }, { add: (item: string) => void }> = cart;

const Accent = createContext<Signal<string>>('accent');
const Locale = createContext('locale', 'en');

const readAccent = (node: Node): string | undefined => Accent.use(node)?.value;
const readLocale = (node: Node): string => Locale.use(node);
`,
    ),
    callout('tip', 'Every exported type is listed in the [API reference](/docs/api).'),
  ],
};
