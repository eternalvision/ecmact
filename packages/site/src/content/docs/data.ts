import { code, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** resource(): async data as signals. */
export const page: DocPage = {
  slug: 'data',
  title: 'Data fetching',
  summary: 'resource() turns an async function into signals: data, error and loading.',
  group: 'Application',
  blocks: [
    p(
      '`resource` turns an async function into signals. It runs the fetcher, tracks the signals the fetcher reads, runs it again when one changes, and aborts the request that a newer one replaces, so a slow answer can never overwrite a fresh one.',
    ),
    code(
      'ts',
      `
import { createHttp, effect, resource, signal, tags } from 'ecmact';

const api = createHttp({ baseURL: '/api' });
const page = signal(1);

const users = resource(({ signal: aborted }) =>
  api.get<User[]>('/users', { params: { page: page.value }, signal: aborted }).then((response) => response.data),
);

const list = tags.ul();

effect(() => {
  list.setState({ children: (users.data.value ?? []).map((user) => tags.li({ content: user.name })) });
});

page.value = 2;
`,
    ),
    table(
      ['Member', 'Description'],
      ['`data`', 'Signal with the latest result, or `initial`.'],
      ['`error`', 'Signal with the reason of the latest failure, `undefined` otherwise.'],
      ['`loading`', 'Signal that is `true` while a request is in flight.'],
      ['`refetch()`', 'Runs the fetcher again.'],
      ['`mutate(value)`', 'Sets the data by hand, for optimistic updates.'],
      ['`dispose()`', 'Stops reacting, aborts the request in flight and ignores late results.'],
    ),
    ul(
      'The fetcher receives `{ signal }`, an `AbortSignal`. Pass it to `fetch` or to the HTTP client.',
      'Signals read **before** the first `await` are dependencies. Read them early, as `page.value` above.',
      '`resource(fetcher, { initial })` sets the data before the first result arrives.',
    ),
  ],
};
