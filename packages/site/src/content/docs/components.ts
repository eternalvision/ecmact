import { callout, code, demo, h2, h3, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Components: the factories, the props, children, events and lists. */
export const page: DocPage = {
  slug: 'components',
  title: 'Components',
  summary:
    'The em and tags factories, props, content, children, events, refs, updates and keyed lists.',
  group: 'Core',
  blocks: [
    p(
      'Every component is a custom element created through one factory. `em.Name(props)` registers `<em-name>` the first time it is used and returns an element. `tags.div(props)` is the same for a standard tag, so you do not have to write `tag` yourself.',
    ),
    code(
      'ts',
      `
import { em, tags } from 'ecmact';

const card = em.Card({ tag: 'article', content: 'A card', class: 'card' });
const button = tags.button({ type: 'button', content: 'Save', onclick: () => save() });
`,
    ),
    h2('Props'),
    table(
      ['Prop', 'Meaning'],
      ['`tag`', 'The tag of the inner element. Defaults to `div`.'],
      ['`content`', 'Text content. Never parsed as HTML.'],
      ['`html`', 'Raw HTML for the inner element. Use it only for markup you control.'],
      ['`children`', 'Nodes, text, numbers and signals to put inside.'],
      ['`style`', 'Inline styles with camelCase keys. Values may be signals.'],
      ['`css`', 'Stylesheet text scoped to the shadow root.'],
      ['`ref`', 'Called once with the inner element, right after it is created.'],
      ['`shadow`', 'Render into the light DOM when `false`. Read on the first render.'],
      ['`key`', 'Identifies a component among its siblings in a list.'],
      ['`on<event>`', 'An event listener: `onclick`, `oninput`, `onkeydown`, and so on.'],
      [
        '`mounted`, `unmounted`, `beforeUpdate`, `updated`',
        'Lifecycle hooks, see [Lifecycle](/docs/lifecycle).',
      ],
      ['`provide`, `error`, `field`', 'Context values, error handling and form association.'],
      ['anything else', 'Becomes an attribute of the inner element.'],
    ),
    h2('Content and children'),
    p(
      'Text goes in `content`. Structure goes in `children`, which takes nodes: components, plain DOM elements, strings and numbers. `false`, `true`, `null` and `undefined` render nothing, so conditions are plain expressions.',
    ),
    code(
      'ts',
      `
const panel = em.Panel({
  tag: 'section',
  children: [
    tags.h2({ content: 'Inbox' }),
    unread > 0 && tags.span({ content: \`\${unread} unread\` }),
    'plain text works too',
  ],
});
`,
    ),
    h2('Attributes'),
    p(
      'Any prop that is not reserved and does not start with `on` is set on the inner element: strings and numbers as they are, `true` as an empty attribute, and `false`, `null` and `undefined` remove it. Attribute names are the HTML ones: `class`, not `className`.',
    ),
    code(
      'ts',
      `
em.Field({
  tag: 'input',
  type: 'email',
  placeholder: 'you@example.com',
  required: true,
  'aria-label': 'Email',
  'data-testid': 'email',
});
`,
    ),
    h2('Events'),
    p(
      'A prop that starts with `on` and holds a function becomes a listener on the inner element. Listeners are replaced on every update, so there are no duplicates, and removing the prop removes the listener. A string value is never evaluated.',
    ),
    code(
      'ts',
      `
tags.input({
  oninput: (event) => console.log((event.target as HTMLInputElement).value),
  onkeydown: (event) => event.key === 'Enter' && submit(),
});

tags.div({
  onwheel: { handler: (event) => scrollBy(event.deltaY), passive: true },
  onclick: { handler: log, capture: true },
});
`,
    ),
    p(
      'To listen in the capture phase or passively, pass an object with a `handler` and `capture` or `passive`. Events bubble out of the Shadow DOM by the usual rules, retargeted to the host.',
    ),
    h2('Refs'),
    code(
      'ts',
      `
let input!: HTMLInputElement;

tags.input({ ref: (element) => (input = element) });

input.focus();
`,
    ),
    h2('Updating a component'),
    p(
      '`setState(props)` merges new props into the current ones and updates the element in place: the DOM node is reused, so focus, selection and typed text survive. `props` reads and replaces all props.',
    ),
    code(
      'ts',
      `
const status = tags.p({ content: 'Idle' });

status.setState({ content: 'Saving...', style: { opacity: 0.6 } });
`,
    ),
    callout(
      'note',
      '`setState` shallow-merges: a nested object such as `style` is replaced, not merged. To change one style property, pass the whole object. Or bind props to [signals](/docs/signals) and skip `setState`.',
    ),
    h2('Lists and keys'),
    p(
      'Give each component in a list a `key`. The list is then reconciled by key: components are matched, moved with a minimal number of moves and kept, with their state, when the list changes.',
    ),
    demo('todo'),
    h3('The each helper'),
    p(
      '`each(items, render, options)` builds such a list for you. It takes an array or a signal of an array and a function that makes one component per item, keys the items, follows the signal while the list is in the document and reconciles the list when the array changes. The list is an ordinary component, a `div` unless `tag` says otherwise.',
    ),
    code(
      'ts',
      `
import { each, signal, tags } from 'ecmact';

const todos = signal([{ id: 1, title: 'Write docs' }]);

const list = each(todos, (todo) => tags.li({ content: todo.title }), {
  tag: 'ul',
  by: (todo) => todo.id,
  empty: 'Nothing to do',
});

todos.value = [...todos.value, { id: 2, title: 'Ship it' }];
`,
    ),
    ul(
      '`by` gives an item its key. Without it a string or a number is its own key and anything else is keyed by its position, so give `by` for objects.',
      '`empty` is shown while there are no items. Everything else in the options is a prop of the list element.',
      '`render` must return a component, because a key belongs to a component. Put a new array into the signal: an array that is changed in place is not noticed.',
    ),
    h3('Performance of large lists'),
    p(
      'Measured in Chromium, a thousand rows (three components each) take about 95 ms to create. If you keep one component per key in a `Map` and pass the same instances again, swapping and removing rows is 6 to 8 times cheaper than recreating them. Ten thousand rows take about a second to create: paginate or render only the rows in view.',
    ),
    ul(
      'Create child components in the render step when they depend on state, and give them a `key`.',
      'For large lists keep a component per key and update it with `setState` or signals.',
      'The library does not virtualize.',
    ),
  ],
};
