import { callout, code, demo, h2, h3, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The HTTP client: createHttp, config, errors, interceptors, retries. */
export const page: DocPage = {
  slug: 'http',
  title: 'HTTP client',
  summary:
    'An axios-style client on fetch: interceptors, cancellation, timeouts, retries and typed errors.',
  group: 'Application',
  blocks: [
    p(
      '`createHttp` makes a client used like axios: the same method shortcuts, config, interceptors and errors, on top of `fetch`. It has no dependencies and runs wherever `fetch` does: browsers, Node 18 and newer, workers.',
    ),
    demo('http'),
    code(
      'ts',
      `
import { createHttp } from 'ecmact';

const api = createHttp({ baseURL: 'https://api.example.com', timeout: 5000 });

const { data } = await api.get<User[]>('/users', { params: { page: 1 } });
await api.post('/users', { name: 'Ada' });
`,
    ),
    h2('Calls'),
    table(
      ['Call', 'Description'],
      ['`api(config)`, `api(url, config?)`, `api.request(config)`', 'Send a request.'],
      ['`get`, `delete`, `head`, `options`', '`(url, config?)`.'],
      ['`post`, `put`, `patch`', '`(url, data?, config?)`. Objects are sent as JSON.'],
      ['`postForm`, `putForm`, `patchForm`', 'An object is sent as `multipart/form-data`.'],
      ['`getUri(config?)`', 'The URL a config would request. Sends nothing.'],
    ),
    h2('Config'),
    table(
      ['Option', 'Description'],
      [
        '`baseURL`, `params`, `paramsSerializer`',
        'URL building. Arrays are `a[]=1&a[]=2`, nested objects `a[b]=1`.',
      ],
      [
        '`headers`',
        'Case-insensitive; `common`, `get`, `post`, ... buckets in defaults; `null` removes a header.',
      ],
      [
        '`data`, `transformRequest`, `transformResponse`',
        'Bodies. Objects become JSON; JSON responses are parsed.',
      ],
      ['`timeout`, `signal`', 'Abort after a time, or when an `AbortSignal` aborts.'],
      ['`responseType`', '`json` (default), `text`, `blob`, `arraybuffer`, `formdata`, `stream`.'],
      ['`validateStatus`', 'Which statuses succeed. Default 200 to 299.'],
      [
        '`auth`, `withCredentials`, `xsrf*`',
        'Basic auth, cookies for other origins, XSRF cookie to header.',
      ],
      ['`onDownloadProgress`', '`{ loaded, total, progress }` while the body arrives.'],
      ['`retry`', 'A number of retries, or `{ retries, delay, retryOn }`.'],
    ),
    p(
      'Precedence: library defaults, then `createHttp(config)` and `api.defaults`, then the request; the last one wins. Headers merge bucket by bucket.',
    ),
    h2('Errors'),
    p(
      'A request rejects with an `HttpError` when the status fails `validateStatus`, when nothing answered, on a timeout, when it was cancelled and for an invalid URL. It carries `code`, `status`, `response`, `config` and `cause`, and `toJSON()` masks the keys listed in `redact`.',
    ),
    table(
      ['Code', 'Meaning'],
      ['`ERR_BAD_REQUEST`', 'A 4xx status.'],
      ['`ERR_BAD_RESPONSE`', 'A 5xx status, or one that `validateStatus` rejected.'],
      ['`ERR_NETWORK`', 'No answer: network down, host unreachable, CORS.'],
      [
        '`ECONNABORTED`, `ETIMEDOUT`',
        'The timeout ran out (`ETIMEDOUT` with `clarifyTimeoutError`).',
      ],
      ['`ERR_CANCELED`', 'The `signal` aborted. The error is a `CanceledError`.'],
    ),
    code(
      'ts',
      `
import { isCancel, isHttpError } from 'ecmact';

try {
  await api.get('/users/1');
} catch (error) {
  if (isCancel(error)) return;
  if (isHttpError(error)) {
    if (error.response) console.log(error.status, error.response.data);
    else console.log(error.code);
  }
}
`,
    ),
    h2('Interceptors'),
    p(
      'Request interceptors run in reverse order of adding; response interceptors run in the order of adding. Both take a second argument that handles errors, and an interceptor can recover by returning a value or rethrow.',
    ),
    code(
      'ts',
      `
api.interceptors.request.use((config) => ({
  ...config,
  headers: { ...config.headers, Authorization: \`Bearer \${session.token}\` },
}));

const id = api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isHttpError(error) && error.status === 401) await session.refresh();
    throw error;
  },
);

api.interceptors.response.eject(id);
`,
    ),
    h3('Cancelling, timeouts and retries'),
    code(
      'ts',
      `
const controller = new AbortController();
const pending = api.get('/slow', { signal: controller.signal });
controller.abort();

await api.get('/flaky', { retry: 3 });
await api.post('/orders', order, {
  retry: { retries: 2, delay: 500, retryOn: (error) => error.status === 503 },
});
`,
    ),
    ul(
      'Cancelling uses `AbortSignal` only. A request cancelled before it is sent never reaches the network.',
      'The default retry policy retries network failures, timeouts and 5xx statuses of idempotent methods, never a cancellation, and waits `300 * 2 ** attempt` ms. Axios has nothing like it built in.',
    ),
    callout(
      'note',
      'Differences from axios: it is built on `fetch`, so there is no Node `http` adapter, proxy or upload progress. `CancelToken`, `axios.all` and `axios.spread` are not provided. JSON that cannot be parsed stays text.',
    ),
  ],
};
