/** One export of the package. */
export interface ApiEntry {
  /** The exported name. */
  name: string;
  /** One sentence: what it is for. */
  summary: string;
  /** The documentation page where it is explained. */
  page: string;
}

/** The exports of the package, by area. */
export const api: Record<string, ApiEntry[]> = {
  Components: [
    {
      name: 'em',
      summary: 'Factory for custom-element components: `em.Name(props)`.',
      page: 'components',
    },
    {
      name: 'tags',
      summary: 'Factories for standard tags: `tags.div(props)`.',
      page: 'components',
    },
    {
      name: 'mount',
      summary: 'Appends components to a container given as a selector or an element.',
      page: 'components',
    },
    {
      name: 'configure',
      summary: 'Global defaults: Shadow DOM, shared stylesheets, error handler, warnings.',
      page: 'styling',
    },
    { name: 'createContext', summary: 'Creates a context key.', page: 'context' },
    {
      name: 'provide',
      summary: 'Pairs a context with a value for the `provide` prop.',
      page: 'context',
    },
    {
      name: 'consume',
      summary: 'Reads the nearest provided value above an element.',
      page: 'context',
    },
  ],
  Signals: [
    { name: 'signal', summary: 'A writable reactive value.', page: 'signals' },
    {
      name: 'computed',
      summary: 'A derived value, lazy and memoized, with an optional equality cutoff.',
      page: 'signals',
    },
    {
      name: 'effect',
      summary: 'Runs now and again when the signals it read change.',
      page: 'signals',
    },
    { name: 'batch', summary: 'Groups writes so that effects run once.', page: 'signals' },
    { name: 'untracked', summary: 'Reads signals without subscribing.', page: 'signals' },
    { name: 'isSignal', summary: 'Type guard for signals and computed values.', page: 'signals' },
  ],
  Styling: [
    { name: 'styled', summary: 'Components from CSS in tagged templates.', page: 'styled' },
    { name: 'css', summary: 'A shareable piece of CSS for styled components.', page: 'styled' },
    { name: 'keyframes', summary: 'Frames of an animation for styled components.', page: 'styled' },
    {
      name: 'ThemeProvider',
      summary: 'Offers a theme to styled components below it.',
      page: 'styled',
    },
    { name: 'themeContext', summary: 'The context that carries the theme.', page: 'styled' },
    {
      name: 'useTheme',
      summary: 'Reads the theme signal that applies to an element.',
      page: 'styled',
    },
  ],
  Routing: [
    {
      name: 'createRouter',
      summary: 'A History API router with outlet, links, nested routes and guards.',
      page: 'routing',
    },
  ],
  State: [
    { name: 'createStore', summary: 'A store with selectors as signals.', page: 'state' },
    {
      name: 'combine',
      summary: 'Initial values plus actions, with inferred types.',
      page: 'state',
    },
    { name: 'persist', summary: 'Keeps part of the state in a storage.', page: 'state' },
    {
      name: 'createJSONStorage',
      summary: 'A JSON storage over `localStorage`, `sessionStorage` or any string storage.',
      page: 'state',
    },
    { name: 'devtools', summary: 'Connects a store to Redux DevTools.', page: 'state' },
    { name: 'shallow', summary: 'One-level comparison for selectors.', page: 'state' },
  ],
  Data: [
    {
      name: 'resource',
      summary: 'An async function as `data`, `error` and `loading` signals.',
      page: 'data',
    },
    {
      name: 'createHttp',
      summary: 'An HTTP client on `fetch` with interceptors and retries.',
      page: 'http',
    },
    { name: 'http', summary: 'A ready-made client with the library defaults.', page: 'http' },
    { name: 'HttpError', summary: 'The error of a failed request.', page: 'http' },
    { name: 'CanceledError', summary: 'The error of a cancelled request.', page: 'http' },
    { name: 'isHttpError', summary: 'Type guard for `HttpError`.', page: 'http' },
    { name: 'isCancel', summary: 'Type guard for `CanceledError`.', page: 'http' },
    { name: 'toFormData', summary: 'Turns an object into `FormData`.', page: 'http' },
  ],
  Delivery: [
    {
      name: 'defineWidget',
      summary: 'Registers a custom element for embedding in any page.',
      page: 'widgets',
    },
  ],
};

/**
 * Lists the names of every documented export.
 *
 * @returns The names, in the order of the groups.
 */
export const apiNames = () =>
  Object.values(api)
    .flat()
    .map((entry) => entry.name);
