import { computed, createHttp, effect, em, resource, signal, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
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
  .bad { color: var(--danger); }
`;

const people = ['Ada', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia'];

/**
 * An HTTP client against a fake server that answers after half a second. Break the server and the request is
 * retried twice before it fails; page forward quickly and the request that a newer one replaced is aborted.
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
        resolve(
          new Response(JSON.stringify(rows), {
            status: broken.peek() ? 503 : 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
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

  const users = resource(({ signal: aborted }) => {
    const current = page.value;
    return api
      .get<string[]>('/people', { params: { page: current }, signal: aborted })
      .then((response) => response.data);
  });

  const list = tags.ul({ shadow: false });

  return em.People({
    shadow: true,
    css,
    mounted: () =>
      effect(() =>
        list.setState({
          children: (users.data.value ?? []).map((name) =>
            tags.li({ shadow: false, content: name }),
          ),
        }),
      ),
    children: [
      tags.div({
        shadow: false,
        class: 'bar',
        children: [
          tags.button({
            shadow: false,
            content: 'Previous',
            onclick: () => (page.value = Math.max(0, page.value - 1)),
          }),
          tags.button({
            shadow: false,
            content: 'Next',
            onclick: () => (page.value = Math.min(2, page.value + 1)),
          }),
          tags.label({
            shadow: false,
            children: [
              tags.input({
                shadow: false,
                type: 'checkbox',
                onchange: (event) => (broken.value = (event.target as HTMLInputElement).checked),
              }),
              'Break the server',
            ],
          }),
        ],
      }),
      list,
      tags.p({
        shadow: false,
        content: computed(() =>
          users.loading.value
            ? 'Loading...'
            : users.error.value
              ? `Failed: ${(users.error.value as Error).message}`
              : `Page ${page.value + 1} loaded`,
        ),
      }),
    ],
  });
};
