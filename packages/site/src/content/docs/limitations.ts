import { callout, h2, p, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** When ECMact is the right tool, and what it does not do yet. */
export const page: DocPage = {
  slug: 'limitations',
  title: 'Limitations',
  summary: 'Where ECMact fits best, and an honest list of what it does not do.',
  group: 'Reference',
  blocks: [
    h2('Where it fits'),
    p(
      'ECMact fits best where an interface has to live inside something else: a page you do not control, an existing application, a browser extension. Components are custom elements with an isolated Shadow DOM, there are no runtime dependencies, and nothing needs a framework on the host page.',
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
      '**No server-side rendering or hydration.** If the server has to deliver ready content for search engines or first paint, use something else. Importing the library is safe without a DOM; creating components needs one.',
      '**A small router.** Nested routes and guards exist, but there is no route-level data loading, transitions or scroll restoration.',
      '**Shadow DOM needs care with forms.** `field: true` connects a control to the form around it. Labels, `for` and `id` links and outer stylesheets still do not cross the boundary; `shadow: false` removes the problem where it matters.',
      '**No virtualization.** A thousand rows are fine, ten thousand take about a second to create. Beyond that, paginate or render only the rows in view.',
    ),
    h2('Design limits'),
    ul(
      '**One inner element.** A component renders a single element. Compose components for more complex structures.',
      '**Children are not a reactive prop.** The list is rebuilt in an effect; text items in it can be signals.',
      '**Listener options** are `capture` and `passive`. There is no `once`, because listeners are re-attached on every update.',
      '**Configuration is read at render time.** `configure` does not update components that are already rendered.',
      '**Shadow DOM choice is final.** It is made on the first render and cannot be changed afterwards.',
    ),
    callout(
      'note',
      'ECMact is young. Browser support is any evergreen browser with Custom Elements v1 and Shadow DOM; constructable stylesheets are used when available. No polyfills are included.',
    ),
  ],
};
