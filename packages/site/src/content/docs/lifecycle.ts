import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Lifecycle hooks, how long elements follow signals, error handling and development warnings. */
export const page: DocPage = {
  slug: 'lifecycle',
  title: 'Lifecycle and errors',
  summary: 'Hooks for mounting and cleanup, automatic cleanup of effects, and error handling.',
  group: 'Core',
  blocks: [
    p(
      'A component made with `em` has two hooks. They are props, so they are declared next to the rest of the component, and each one receives the component itself. Plain elements made with `tags` have no hooks.',
    ),
    table(
      ['Hook', 'When it runs'],
      [
        '`mounted(host)`',
        'Every time the component is connected to a document. May return a cleanup function.',
      ],
      [
        '`unmounted(host)`',
        'Every time it is disconnected, after the cleanup that `mounted` returned.',
      ],
    ),
    code(
      'ts',
      `
import { em, mount, signal, tags } from 'ecmact';

const { output } = tags;

const time = signal(new Date().toLocaleTimeString());

const clock = em.Clock(
  {
    mounted: () => {
      const timer = setInterval(() => (time.value = new Date().toLocaleTimeString()), 1000);
      return () => clearInterval(timer);
    },
    unmounted: () => console.log('the clock left the page'),
  },
  output(time),
);

mount('#app', clock);
`,
    ),
    h2('Effects and resources clean up themselves'),
    p(
      'An `effect` or a [resource](/docs/data) created inside `mounted` is stopped when the component is disconnected. You do not return anything for them. Return a cleanup only for what the library does not know about: timers, observers, listeners on `window`.',
    ),
    code(
      'ts',
      `
import { effect, em, mount, signal, tags } from 'ecmact';

const { button } = tags;

const unread = signal(0);

const inbox = em.Inbox(
  {
    mounted: () => {
      effect(() => {
        document.title = \`\${unread.value} unread\`;
      });
    },
  },
  button({ onclick: () => unread.value++ }, 'New message'),
);

mount('#app', inbox);
`,
    ),
    p('The `render` function of a [widget](/docs/widgets) works the same way.'),
    h2('Leaving and coming back'),
    ul(
      'A component that leaves the document stops following signals, together with everything inside it. When it comes back, its reactive children and props run once to catch up, and `mounted` runs again.',
      'A component that is moved is disconnected and connected at once. The cleanup, `unmounted` and `mounted` run, and it keeps following signals in between.',
      'The nodes that a reactive child or `each` takes out of the page stop following signals too.',
    ),
    callout(
      'warning',
      'A plain element that you take out of the document by hand, with `element.remove()` for example, keeps following its signals: it still updates, and the signals keep it in memory. To take a part of the page out, return it from a reactive child, such as `() => (open.value ? panel : null)`, or put it inside a component.',
    ),
    h2('Handling errors'),
    p(
      'An error thrown by an event listener or by a hook goes to the nearest `error` prop: the one on the element itself or on an element above it, across shadow roots. `error` works on any element. If there is none, the error goes to `configure({ onError })`. With no handler at all the error is rethrown, exactly as if there were no error handling.',
    ),
    code(
      'ts',
      `
import { configure, mount, tags } from 'ecmact';

const { button, section } = tags;

configure({
  onError: (error, info) => console.error(info.phase, info.element.localName, error),
});

mount(
  '#app',
  section(
    { error: (error, { phase, event }) => console.warn(\`\${phase} \${event ?? ''}\`, error) },
    button(
      {
        onclick: () => {
          throw new Error('This goes to the section');
        },
      },
      'Break',
    ),
  ),
);
`,
    ),
    p(
      'The handler receives the error and `{ element, phase, event }`: the element with the listener or the component with the hook, the phase, and the event name for the `event` phase.',
    ),
    table(
      ['Phase', 'Source'],
      ['`event`', 'A listener passed as an `on<event>` prop.'],
      ['`mounted`', 'The `mounted` hook.'],
      ['`cleanup`', 'The function that `mounted` returned.'],
      ['`unmounted`', 'The `unmounted` hook.'],
    ),
    callout(
      'note',
      'Only these synchronous errors are caught. A rejected promise of an `async` handler is not seen: handle it inside the handler. An error in a reactive child or prop, or in `ref`, is not passed to the handler either: it is thrown where the element is created, or from the write to the signal that made the function run again.',
    ),
    h2('Warnings'),
    p(
      'The library warns in the console, once per message, about things that are almost certainly mistakes: `css` without a shadow root, children next to `html`, a duplicate key in `each`, an object passed as an attribute or a style, a handler that is not a function. Turn them off with `configure({ warnings: false })`.',
    ),
  ],
};
