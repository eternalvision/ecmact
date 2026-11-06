/** A card on the home page. */
export interface Feature {
  /** The path data of its 24 by 24 icon. */
  icon: string[];
  /** The title. */
  title: string;
  /** One or two sentences. */
  text: string;
  /** The documentation page it leads to. */
  page: string;
}

/** What ECMact offers, as cards. */
export const features: Feature[] = [
  {
    icon: [
      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      'M3.27 6.96 12 12.01l8.73-5.05',
      'M12 22.08V12',
    ],
    title: 'Native Web Components',
    text: 'Every component is a real custom element in an open Shadow DOM. No virtual DOM, no template language, no compiler.',
    page: 'components',
  },
  {
    icon: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
    title: 'Signals',
    text: 'Push-based signals, computed values and effects. Bind a prop to a signal and only that node updates.',
    page: 'signals',
  },
  {
    icon: ['M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'],
    title: 'Styled components',
    text: 'CSS in tagged templates with props, signals, themes and animations, scoped to the component.',
    page: 'styled',
  },
  {
    icon: ['M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z', 'M8 2v16', 'M16 6v16'],
    title: 'Router',
    text: 'History API routing with an outlet, nested routes, async guards and lazy views.',
    page: 'routing',
  },
  {
    icon: [
      'M21 5c0 1.66-4.03 3-9 3S3 6.66 3 5s4.03-3 9-3 9 1.34 9 3z',
      'M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3',
      'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5',
    ],
    title: 'State management',
    text: 'A zustand-style store with selectors as signals, persistence and Redux DevTools.',
    page: 'state',
  },
  {
    icon: [
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      'M2 12h20',
      'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    ],
    title: 'HTTP client',
    text: 'An axios-style client on fetch: interceptors, timeouts, cancellation, retries and typed errors.',
    page: 'http',
  },
  {
    icon: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    title: 'Isolation by design',
    text: 'Shadow DOM keeps your styles out of the page and the page out of your styles. Themes cross it as CSS variables.',
    page: 'styling',
  },
  {
    icon: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
    title: 'Typed per tag',
    text: 'Attributes, events, styles and refs are typed by the tag you choose. A typo in `onclik` is a compile error.',
    page: 'typescript',
  },
  {
    icon: [
      'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
      'M14 2v6h6',
      'M16 13H8',
      'M16 17H8',
      'M10 9H8',
    ],
    title: 'Forms that work',
    text: 'Live values for controls, and fields that join the surrounding form across the Shadow DOM.',
    page: 'forms',
  },
  {
    icon: [
      'M23 4v6h-6',
      'M1 20v-6h6',
      'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
    ],
    title: 'Lifecycle and errors',
    text: 'Mount, update and cleanup hooks, and one place to handle every error the app throws.',
    page: 'lifecycle',
  },
  {
    icon: ['M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z', 'M16 8 2 22', 'M17.5 15H9'],
    title: 'Embeddable widgets',
    text: 'defineWidget turns an interface into a custom element that any page can use with one script tag.',
    page: 'widgets',
  },
  {
    icon: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01l-3-3'],
    title: 'Zero dependencies',
    text: 'Nothing at runtime. ES and CommonJS, tree-shakeable, with 100% test coverage of every line.',
    page: 'tooling',
  },
];

/** A use case on the home page. */
export interface UseCase {
  /** The title. */
  title: string;
  /** One sentence. */
  text: string;
}

/** What ECMact is for. */
export const useCases: UseCase[] = [
  {
    title: 'Widgets for other sites',
    text: 'Calculators, request forms, pickers and configurators that live inside a page you do not control.',
  },
  {
    title: 'Blocks for a CMS',
    text: 'Extra functionality for Webflow, WordPress or any existing site, with one script tag and no build on its side.',
  },
  {
    title: 'Browser utilities',
    text: 'File converters, JSON editors, document generators and data viewers that run entirely in the browser.',
  },
  {
    title: 'Internal tools',
    text: 'Small admin panels, service monitors and API front ends that do not need a whole framework.',
  },
  {
    title: 'Browser extensions',
    text: 'Popups, options pages and side panels, where size and isolation from the page matter.',
  },
  {
    title: 'Gradual modernization',
    text: 'Add new screens to an older application one component at a time, without rewriting it.',
  },
];
