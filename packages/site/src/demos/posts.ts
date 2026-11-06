import { computed, createHttp, each, em, resource, signal, tags, type HttpError } from 'ecmact';

const css = `
  :host, div { display: block; }
  form { display: flex; gap: 0.5rem; margin-bottom: 0.8rem; }
  form > em-input { flex: 1; min-width: 0; }
  input {
    box-sizing: border-box;
    width: 100%;
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
  ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.4rem; }
  li { display: flex; gap: 0.6rem; align-items: center; }
  li > em-span { display: block; flex: 1; min-width: 0; }
  li span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  button:disabled { cursor: not-allowed; opacity: 0.5; }
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
 * with `mutate` and are undone by their inverse if the request fails, so that overlapping changes do not take each
 * other back. The form waits for the first load, because a late answer would replace an optimistic change. A request
 * and a response interceptor count the requests and show how long the last one took.
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
  api.interceptors.response.use(
    (response) => {
      last.value = Math.round(response.duration);
      return response;
    },
    (error) => {
      const { response } = error as HttpError;
      if (response) last.value = Math.round(response.duration);
      return Promise.reject(error);
    },
  );

  const posts = resource(({ signal: aborted }) =>
    api
      .get<Post[]>('/posts', { params: { _limit: 5 }, signal: aborted })
      .then((response) => response.data),
  );

  const current = () => posts.data.value ?? [];

  const attempt = async (
    apply: (posts: Post[]) => Post[],
    undo: (posts: Post[]) => Post[],
    request: () => Promise<unknown>,
  ) => {
    problem.value = '';
    posts.mutate(apply(current()));
    try {
      await request();
    } catch {
      posts.mutate(undo(current()));
      problem.value = 'The request failed, so the change was taken back.';
    }
  };

  const list = each(
    computed(() => current()),
    (post) =>
      tags.li({
        shadow: false,
        children: [
          tags.span({ shadow: false, content: post.title }),
          tags.button({
            shadow: false,
            type: 'button',
            content: 'Delete',
            disabled: posts.loading,
            onclick: () => {
              const index = current().findIndex((item) => item.id === post.id);
              void attempt(
                (posts) => posts.filter((item) => item.id !== post.id),
                (posts) => [...posts.slice(0, index), post, ...posts.slice(index)],
                () => api.delete(`/posts/${post.id}`),
              );
            },
          }),
        ],
      }),
    { shadow: false, tag: 'ul', by: (post) => post.id },
  );
  const input = tags.input({
    shadow: false,
    placeholder: 'Title of a new post',
    'aria-label': 'Title',
    disabled: posts.loading,
  });

  return em.Posts({
    shadow: true,
    css,
    children: [
      tags.form({
        shadow: false,
        onsubmit: (event) => {
          event.preventDefault();
          const field = input.element as HTMLInputElement;
          const title = field.value.trim();
          if (title === '' || posts.loading.value) return;
          field.value = '';
          const post = { id: Date.now(), title };
          void attempt(
            (list) => [...list, post],
            (list) => list.filter((item) => item.id !== post.id),
            () => api.post('/posts', { title, body: '', userId: 1 }),
          );
        },
        children: [
          input,
          tags.button({ shadow: false, type: 'submit', content: 'Add', disabled: posts.loading }),
        ],
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
