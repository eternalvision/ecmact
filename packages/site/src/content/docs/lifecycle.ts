import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Lifecycle hooks, error handling and development warnings. */
export const page: DocPage = {
  slug: 'lifecycle',
  title: 'Lifecycle and errors',
  summary: 'Hooks for mounting, updating and cleanup, and a single place to handle errors.',
  group: 'Core',
  blocks: [
    p(
      'A component has four hooks. They are props, so they are declared next to the rest of the component, and each one receives the component itself.',
    ),
    table(
      ['Hook', 'When it runs'],
      [
        '`mounted(element, component)`',
        'When the component is connected to a document. May return a cleanup function.',
      ],
      ['`unmounted(element, component)`', 'When it is disconnected, after the cleanup.'],
      [
        '`beforeUpdate(next, current, component)`',
        'Before an update. Returning `false` cancels it and the new props are discarded.',
      ],
      ['`updated(element, component, previous)`', 'After every render except the first.'],
    ),
    code(
      'ts',
      `
tags.div({
  content: 'Clock',
  mounted: (element, component) => {
    const timer = setInterval(() => component.setState({ content: new Date().toLocaleTimeString() }), 1000);
    return () => clearInterval(timer);
  },
  beforeUpdate: (next) => next.content !== '',
  updated: (element, _component, previous) => console.log('was', previous.content),
});
`,
    ),
    ul(
      'Signals that props read are followed only while the component is in the document, and are released when it leaves.',
      'A component that is moved is disconnected and connected again: `mounted` runs again, after its cleanup.',
    ),
    h2('Handling errors'),
    p(
      'Errors in hooks, listeners and rendering go to one handler: the `error` prop of the component, or `configure({ onError })` for the whole app. With no handler at all the error is rethrown, exactly as if there were no error handling. Nothing is swallowed silently.',
    ),
    code(
      'ts',
      `
import { configure } from 'ecmact';

configure({
  onError: (error, info) => report(error, { phase: info.phase, tag: info.component.localName }),
});
`,
    ),
    table(
      ['Phase', 'Source'],
      ['`render`', 'Rendering, including a throwing `ref`.'],
      ['`event`', 'A listener passed as an `on<event>` prop.'],
      ['`mounted`, `cleanup`, `unmounted`', 'The hooks and the cleanup that `mounted` returned.'],
      [
        '`beforeUpdate`, `updated`',
        'The update hooks. A failed `beforeUpdate` does not cancel the update.',
      ],
    ),
    callout(
      'note',
      'Only synchronous errors are caught. A rejected promise of an `async` handler is not seen: handle it inside the handler.',
    ),
    h2('Warnings'),
    p(
      'In development the library warns once about things that are almost certainly mistakes: `css` without a shadow root, a `shadow` that changed after the first render, an object passed as an attribute. Turn them off with `configure({ warnings: false })`.',
    ),
  ],
};
