import { callout, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** When ECMact is the right tool, and what it does not do. */
export const page: DocPage = {
  slug: 'limitations',
  title: 'Limitations',
  summary: 'Where ECMact fits best, and an honest list of what it does not do.',
  group: 'Reference',
  blocks: [
    h2('Where it fits'),
    p(
      'ECMact fits best where an interface has to live inside something else: a page you do not control, an existing application, a browser extension. Elements are real DOM elements, components and widgets are custom elements with an isolated Shadow DOM, there are no runtime dependencies, and nothing needs a framework on the host page.',
    ),
    ul(
      '**Widgets for other sites:** price calculators, request forms, service pickers, configurators.',
      '**Interactive blocks in a CMS:** extra functionality for Webflow, WordPress or any existing site.',
      '**Browser utilities:** file converters, JSON editors, document generators, data viewers.',
      '**Internal tools:** small admin panels, service monitors, API front ends.',
      '**Browser extensions:** popups, options pages, side panels.',
      '**Modules of an older application:** new screens added one at a time, without a rewrite.',
    ),
    h2('When it is not the right tool'),
    ul(
      '**No server-side rendering or hydration.** If the server has to deliver ready content for search engines or first paint, use something else. Importing the library is safe without a DOM; creating elements needs one.',
      '**A small router.** Nested routes and guards exist, but there is no route-level data loading, transitions or scroll restoration.',
      '**No virtualization.** Every item of a list is a real node. For long lists, paginate or render only the rows in view.',
      '**Shadow DOM needs care with forms.** `field: true` connects a control inside a component to the form around it. Labels with `for` and `id` and the stylesheets of the page still do not cross the boundary. Plain elements and `shadow: false` have no such problem.',
    ),
    h2('Design limits'),
    ul(
      '**Props are applied once.** There is no re-render and no way to pass new props to an element. What has to change reads a signal, or you change the DOM element yourself.',
      '**Listeners are fixed.** An `on<event>` prop is attached when the element is created and is never reactive.',
      '**Configuration is read when an element is created.** `configure` does not update what already exists. Call it first.',
      '**The Shadow DOM choice is final.** `shadow` is read when a component is created and cannot be changed afterwards.',
      '**Hooks belong to components.** Plain elements have no `mounted` and `unmounted`.',
    ),
    h2('Limits described on other pages'),
    table(
      ['Limit', 'Where'],
      [
        'The top of the tree goes through `mount`, not `append`',
        '[Elements and components](/docs/components)',
      ],
      [
        'A row of `each` is rendered again when its item changes under the same key',
        '[Elements and components](/docs/components)',
      ],
      ['`html` and children do not mix', '[Elements and components](/docs/components)'],
      ['What an `effect` function may return', '[Signals](/docs/signals)'],
      ['Plain elements removed by hand keep following signals', '[Lifecycle](/docs/lifecycle)'],
      ['Which errors reach the error handler', '[Lifecycle](/docs/lifecycle)'],
      ['Isolation and growth of styled rules', '[Styled components](/docs/styled)'],
      ['Fields of a store are fixed at creation', '[State management](/docs/state)'],
    ),
    callout(
      'note',
      'ECMact is young. Browser support is any evergreen browser with Custom Elements v1 and Shadow DOM; constructable stylesheets are used when available. No polyfills are included.',
    ),
  ],
};
