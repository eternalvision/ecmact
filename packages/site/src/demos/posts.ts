import { computed, createHttp, effect, em, resource, signal, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
  form { display: flex; gap: 0.5rem; margin-bottom: 0.8rem; }
  input {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }
  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }
  button:hover { border-color: var(--primary); }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
  li { display: flex; gap: 0.6rem; align-items: center; }
  li span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  small { display: block; margin-top: 0.7rem; color: var(--muted); }
  .error { color: var(--danger); }
`;

/** A post. */
interface Post {
  /** The id. */
  id: number;
  /** The title. */
  title: string;
}

/**
 * Create, read and delete against the jsonplaceholder.typicode.com API. Adding and deleting update the list at once
 * with `mutate` and go back if the request fails. A request and a response interceptor count the requests and show
 * how long the last one took.
 *
 * @returns The demo.
 */
export const create = () => {
  const requests = signal(0);
  const last = signal(0);
  const problem = signal('');

  const api = createHttp({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 8000,
    retry: 1,
  });
  api.interceptors.request.use((config) => {
    requests.value++;
    return config;
  });
  api.interceptors.response.use((response) => {
    last.value = Math.round(response.duration);
    return response;
  });

  const posts = resource(({ signal: aborted }) =>
    api
      .get<Post[]>('/posts', { params: { _limit: 5 }, signal: aborted })
      .then((response) => response.data),
  );

  const current = () => posts.data.value ?? [];

  const attempt = async (change: Post[], request: () => Promise<unknown>) => {
    const before = current();
    problem.value = '';
    posts.mutate(change);
    try {
      await request();
    } catch {
      posts.mutate(before);
      problem.value = 'The request failed, so the change was taken back.';
    }
  };

  const list = tags.ul({ shadow: false });
  const input = tags.input({
    shadow: false,
    placeholder: 'Title of a new post',
    'aria-label': 'Title',
  });

  return em.Posts({
    shadow: true,
    css,
    mounted: () =>
      effect(() =>
        list.setState({
          children: current().map((post) =>
            tags.li({
              shadow: false,
              key: post.id,
              children: [
                tags.span({ shadow: false, content: post.title }),
                tags.button({
                  shadow: false,
                  type: 'button',
                  content: 'Delete',
                  onclick: () =>
                    attempt(
                      current().filter((item) => item.id !== post.id),
                      () => api.delete(`/posts/${post.id}`),
                    ),
                }),
              ],
            }),
          ),
        }),
      ),
    children: [
      tags.form({
        shadow: false,
        onsubmit: (event) => {
          event.preventDefault();
          const field = input.element as HTMLInputElement;
          const title = field.value.trim();
          if (title === '') return;
          field.value = '';
          void attempt([...current(), { id: Date.now(), title }], () =>
            api.post('/posts', { title, body: '', userId: 1 }),
          );
        },
        children: [input, tags.button({ shadow: false, type: 'submit', content: 'Add' })],
      }),
      tags.p({
        shadow: false,
        content: computed(() => (posts.loading.value ? 'Loading...' : '')),
      }),
      list,
      tags.p({
        shadow: false,
        class: 'error',
        content: problem,
        hidden: computed(() => problem.value === ''),
      }),
      tags.small({
        shadow: false,
        content: computed(() => `${requests.value} requests, the last one took ${last.value} ms`),
      }),
    ],
  });
};
