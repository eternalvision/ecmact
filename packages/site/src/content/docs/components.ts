import { callout, code, demo, h2, h3, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Elements and components: the factories, props, children, events, lists and mounting. */
export const page: DocPage = {
  slug: 'components',
  title: 'Elements and components',
  summary:
    'The tags and em factories, props, children, reactive values, events, refs, lists and mount.',
  group: 'Core',
  blocks: [
    p(
      'There are two factories. `tags` creates plain DOM elements: `tags.button(...)` returns an `HTMLButtonElement`, with no wrapper around it. `em` creates components: custom elements with a shadow root, their own stylesheet and lifecycle hooks. Use `tags` for everything, and `em` where you need style isolation or hooks.',
    ),
    code(
      'ts',
      `
import { mount, tags } from 'ecmact';

const { a, article, h2, p } = tags;

const card = article(
  { class: 'card' },
  h2('ECMact'),
  p('Reactive interfaces on the DOM.'),
  a({ href: '/docs/getting-started' }, 'Read the docs'),
);

mount('#app', card);
`,
    ),
    p(
      'The first argument is the props if it is a plain object. Everything else is children, in order. Both are optional: `p()`, `p("text")` and `p({ class: "lead" }, "text")` all work.',
    ),
    h2('Children'),
    table(
      ['Child', 'What is rendered'],
      ['A node', 'The node itself: an element, a component, a text node, a fragment.'],
      ['A string or a number', 'Text. It is never parsed as HTML.'],
      ['An array', 'Its items, in order. Nested arrays are flattened.'],
      ['`false`, `true`, `null`, `undefined`', 'Nothing, so conditions are plain expressions.'],
      [
        'A signal or a function',
        'A reactive region: it is rendered again when the signals it reads change.',
      ],
    ),
    p(
      'A reactive child may return text, a node, a list or nothing. That is how conditional rendering works: return the element or `null`.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { button, p, section } = tags;

const open = signal(false);
const unread = signal(3);
const details = p('Shown only while the panel is open.');

mount(
  '#app',
  section(
    button({ onclick: () => (open.value = !open.value) }, () => (open.value ? 'Hide' : 'Show')),
    () => (open.value ? details : null),
    p('Unread: ', unread),
  ),
);
`,
    ),
    h2('Props'),
    table(
      ['Prop', 'Meaning'],
      [
        '`class`',
        'Class names: text, a list, or an object of switches. See [Styling](/docs/styling).',
      ],
      [
        '`style`',
        'Inline styles with camelCase keys. A number is a length in pixels. See [Styling](/docs/styling).',
      ],
      ['`html`', 'Trusted markup for the content of the element.'],
      ['`ref`', 'A function called once with the element, right after it is built.'],
      [
        '`bind`',
        'A signal tied to an `input`, `select` or `textarea` both ways. See [Forms](/docs/forms).',
      ],
      ['`on<event>`', 'An event listener: `onclick`, `oninput`, `onkeydown`, and so on.'],
      ['`provide`', 'Values offered to the elements below. See [Context](/docs/context).'],
      [
        '`error`',
        'A handler for errors of this element and of everything below it. See [Lifecycle](/docs/lifecycle).',
      ],
      ['anything else', 'An attribute of the element.'],
    ),
    callout(
      'note',
      'An element with `html` ignores its children, with a warning. `html` uses `innerHTML` and does not sanitize, see the [security model](/docs/security).',
    ),
    h3('Attributes'),
    p(
      'Strings and numbers are set as they are and `true` sets an empty attribute. `false`, `null` and `undefined` remove the attribute. Names are the HTML ones: `class`, not `className`. `value`, `checked`, `selected` and `indeterminate` are also written as DOM properties.',
    ),
    code(
      'ts',
      `
import { tags } from 'ecmact';

const { input } = tags;

const email = input({
  type: 'email',
  placeholder: 'you@example.com',
  required: true,
  'aria-label': 'Email',
  'data-testid': 'email',
});
`,
    ),
    h3('Reactive props'),
    p(
      'Any attribute, `html`, `class`, `style` and each value inside `style` take a plain value, a signal, or a function that reads signals. The element follows the signals and updates only that attribute or style. `on<event>` handlers and `ref` are functions too, but they are never treated as reactive.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { button } = tags;

const count = signal(0);

mount(
  '#app',
  button(
    {
      disabled: () => count.value >= 3,
      title: () => \`\${3 - count.value} clicks left\`,
      style: { opacity: () => (count.value >= 3 ? 0.5 : 1) },
      onclick: () => count.value++,
    },
    'Click me, three times at most',
  ),
);
`,
    ),
    p(
      'Props are applied once, when the element is created. To change something later, write to a signal that the prop reads, or change the DOM element directly: it is an ordinary element.',
    ),
    h2('Events'),
    p(
      'A prop that starts with `on` is a listener on the element. The handler is typed with the right event. To listen in the capture phase, passively or once, pass an object with a `handler` and the options. A string is never evaluated.',
    ),
    code(
      'ts',
      `
import { tags } from 'ecmact';

const { div, input } = tags;

const search = input({
  oninput: (event) => console.log((event.target as HTMLInputElement).value),
  onkeydown: (event) => {
    if (event.key === 'Enter') console.log('submit');
  },
});

const area = div({
  onwheel: { handler: (event) => console.log(event.deltaY), passive: true },
  onclick: { handler: () => console.log('first click only'), once: true },
});
`,
    ),
    h2('Refs'),
    p(
      'A factory returns the element, so most of the time a variable is enough. `ref` helps when the element is created in the middle of a tree.',
    ),
    code(
      'ts',
      `
import { mount, tags } from 'ecmact';

const { button, form, input } = tags;

let field!: HTMLInputElement;

mount(
  '#app',
  form(
    input({ ref: (element) => (field = element) }),
    button({ type: 'button', onclick: () => field.focus() }, 'Focus the field'),
  ),
);
`,
    ),
    h2('Custom tags'),
    p(
      'A name with a hyphen creates that custom element and accepts any attribute: `tags["x-widget"]({ mode: "compact" })`.',
    ),
    h2('Components'),
    p(
      '`em.Name(props, ...children)` registers a custom element the first time the name is used and returns an instance. The children go into an open shadow root, and the `css` prop is a stylesheet that applies only to them.',
    ),
    code(
      'ts',
      `
import { em, mount, tags } from 'ecmact';

const { h2, p } = tags;

const card = em.UserCard(
  {
    css: \`
      :host { display: block; padding: 16px; border: 1px solid #d0d7e2; border-radius: 12px; }
      h2 { margin: 0; }
    \`,
  },
  h2('Ada Lovelace'),
  p('Engineer'),
);

mount('#app', card);
`,
    ),
    ul(
      '**Names.** The words of a camelCase name are joined with hyphens: `em.UserCard` is `<user-card>`. A name of one word gets a prefix, because a custom element name must contain a hyphen: `em.Card` is `<em-card>`.',
      '**The prefix.** `configure({ prefix: "my" })` makes `em.Card` a `<my-card>`. With `configure({ prefix: "" })` every name must have two words, and a name of one word throws.',
      '**Props.** Attributes, `class`, `style`, listeners and `ref` apply to the custom element itself.',
      '**Component props.** `css`, `shadow`, `mounted` and `unmounted` are described in [Styling](/docs/styling) and [Lifecycle](/docs/lifecycle). `field`, `name` and `disabled` are described in [Forms](/docs/forms).',
    ),
    h2('Lists'),
    p(
      '`each(items, render, options)` renders one node per item and keeps the list in step with the data. Put it among the children of any element: the nodes are placed right there, with no wrapper.',
    ),
    demo('todo'),
    code(
      'ts',
      `
import { each, mount, signal, tags } from 'ecmact';

const { button, li, ul } = tags;

const todos = signal([{ id: 1, title: 'Write docs' }]);

mount(
  '#app',
  ul(
    each(todos, (todo) => li(todo.title), {
      by: (todo) => todo.id,
      empty: li('Nothing to do'),
    }),
  ),
  button(
    {
      onclick: () => {
        todos.value = [...todos.value, { id: todos.value.length + 1, title: 'Ship it' }];
      },
    },
    'Add',
  ),
);
`,
    ),
    ul(
      '`items` is an array, a signal of an array, or a function that returns one. Put a new array into the signal: an array that is changed in place is not noticed.',
      '`render` receives the item and its position and returns a node.',
      '`by` gives an item its key. Without it a string or a number is its own key and anything else is keyed by its position, so give `by` for objects.',
      '`empty` is shown while there are no items.',
      'When the list changes, an item that is still there keeps its node. Nodes are added, moved and removed with as few DOM operations as possible.',
    ),
    callout(
      'note',
      'An item that is a new object under the same key gets its row rendered again, in place. Focus inside the row is restored by position, but other state of the old row, such as a scroll position, is lost. To update a row without replacing it, keep the item the same and let the row read signals.',
    ),
    p('The library does not virtualize. For long lists, paginate or render only the rows in view.'),
    h2('Mounting'),
    p(
      '`mount(target, ...children)` appends children to an element, given as a selector or as the element. It takes anything a child can be and returns the container.',
    ),
    callout(
      'warning',
      'Use `mount` for the top of the tree, not `parent.append(...)`. Two things are resolved when elements enter the document: [context](/docs/context) lookups made in reactive functions, and the styles of [styled components](/docs/styled). The library does that when elements arrive through `mount`, an `em` component, `each`, a reactive region or a [widget](/docs/widgets). A plain `append` does not trigger it.',
    ),
  ],
};
