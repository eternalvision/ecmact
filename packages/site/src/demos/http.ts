import { createHttp, each, em, signal, tags } from 'ecmact';

const { button, div, input, label, li, p, ul } = tags;

const css = `
  :host { display: block; }
  .bar { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-bottom: 0.75rem; }
  button {
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }
  button:hover { border-color: var(--primary); }
  label { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--muted); }
  ul { margin: 0; padding-left: 1.2rem; min-height: 4.5rem; }
  p { margin: 0.6rem 0 0; color: var(--muted); }
`;

const people = ['Ada', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia'];

/**
 * An HTTP client against a fake server that answers after half a second. `api.resource` reads the page in its
 * address, so paging starts a new request and aborts the one it replaces. Break the server and the request is
 * retried twice before it fails.
 *
 * @returns The demo.
 */
export const create = () => {
  const broken = signal(false);
  const page = signal(0);

  const server = (_url: string | URL | Request, init?: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => {
        const rows = people.slice(page.peek() * 3, page.peek() * 3 + 3);
        resolve(Response.json(rows, { status: broken.peek() ? 503 : 200 }));
      }, 500);
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('aborted', 'AbortError'));
      });
    });

  const api = createHttp({
    baseURL: '/api',
    fetch: server as typeof fetch,
    retry: { retries: 2, delay: 300 },
  });
  const users = api.resource<string[]>(() => `/people?page=${page.value}`);

  return em.People(
    { css },
    div(
      { class: 'bar' },
      button({ onclick: () => (page.value = Math.max(0, page.value - 1)) }, 'Previous'),
      button({ onclick: () => (page.value = Math.min(2, page.value + 1)) }, 'Next'),
      label(input({ type: 'checkbox', bind: broken }), 'Break the server'),
    ),
    ul(
      each(
        () => users.data ?? [],
        (name) => li(name),
      ),
    ),
    p(() => {
      if (users.loading) return 'Loading...';
      if (users.error) return `Failed: ${(users.error as Error).message}`;
      return `Page ${page.value + 1} loaded`;
    }),
  );
};
