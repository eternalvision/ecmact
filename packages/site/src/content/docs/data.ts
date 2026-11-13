import { callout, code, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** resource() and api.resource(): async data with loading and error states. */
export const page: DocPage = {
  slug: 'data',
  title: 'Data fetching',
  summary:
    'resource() turns an async function into data, error and loading that the markup follows.',
  group: 'Application',
  blocks: [
    p(
      'A resource runs a request and exposes `data`, `error` and `loading` as plain properties. Read them in a reactive function and the markup follows the request. When a signal that the request depends on changes, the request runs again and the one in flight is aborted, so a slow answer can never overwrite a fresh one.',
    ),
    h2('From the HTTP client'),
    p(
      '`api.resource(url, config?)` is a resource fed by a GET of the [HTTP client](/docs/http). The URL is text, or a function that reads signals.',
    ),
    code(
      'ts',
      `
import { createHttp, each, mount, signal, tags } from 'ecmact';

interface User {
  id: number;
  name: string;
}

const { button, li, p, ul } = tags;

const api = createHttp({ baseURL: '/api' });
const page = signal(1);

const users = api.resource<User[]>(() => \`/users?page=\${page.value}\`, { initial: [] });

mount(
  '#app',
  p(() => (users.loading ? 'Loading...' : users.error ? 'Could not load' : \`Page \${page.value}\`)),
  ul(each(() => users.data ?? [], (user) => li(user.name), { by: (user) => user.id })),
  button({ onclick: () => page.value++ }, 'Next page'),
);
`,
    ),
    p(
      'The second argument is the config of the request, such as `params` and `headers`, plus `initial`. The resource sets `url` and `signal` itself.',
    ),
    h2('From any async function'),
    p(
      '`resource(fetcher, options?)` works with any function that returns a value or a promise. The fetcher receives `{ signal }`, an `AbortSignal` for that request.',
    ),
    code(
      'ts',
      `
import { mount, resource, signal, tags } from 'ecmact';

const { button, div } = tags;

const id = signal(1);

const user = resource<{ name: string }>(({ signal: aborted }) =>
  fetch(\`/api/users/\${id.value}\`, { signal: aborted }).then((response) => response.json()),
);

mount(
  '#app',
  div(() => (user.loading ? 'Loading...' : user.error ? 'Failed' : user.data?.name)),
  button({ onclick: () => id.value++ }, 'Next user'),
  button({ onclick: () => user.refetch() }, 'Reload'),
);
`,
    ),
    h2('The resource'),
    table(
      ['Member', 'Description'],
      ['`data`', 'The latest result, or `initial`, or `undefined` before the first one.'],
      ['`error`', 'The reason of the latest failure, `undefined` otherwise.'],
      ['`loading`', '`true` while a request is in flight.'],
      ['`refetch()`', 'Runs the fetcher again.'],
      ['`mutate(value)`', 'Sets the data by hand and clears the error, for optimistic updates.'],
      ['`dispose()`', 'Stops reacting, aborts the request in flight and ignores late results.'],
    ),
    ul(
      '`data`, `error` and `loading` are read without `.value`. Reading one inside a reactive function, an effect or a computed value follows it.',
      'Signals read **before** the first `await` are dependencies. Read them early, as `id.value` above.',
      'A new request clears `error` and keeps the old `data` until the answer arrives.',
      'A resource created inside the `mounted` hook of a component, or inside the `render` of a widget, is disposed when the element leaves the document. Anywhere else it lives until you call `dispose()`.',
    ),
    callout(
      'tip',
      'Pass the `AbortSignal` on to `fetch`. Without it the old request still runs to the end; its result is ignored either way.',
    ),
  ],
};
