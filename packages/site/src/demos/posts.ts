import { createHttp, each, em, signal, tags, type HttpError } from 'ecmact';

const { button, form, input, li, p, small, span, ul } = tags;

const css = `
  :host { display: block; }
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
  ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.4rem; }
  li { display: flex; gap: 0.6rem; align-items: center; }
  li span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  const title = signal('');

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

  const posts = api.resource<Post[]>('/posts', { params: { _limit: 5 } });
  const current = () => posts.data ?? [];

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

  const add = (event: Event) => {
    event.preventDefault();
    const text = title.value.trim();
    if (text === '' || posts.loading) return;
    title.value = '';
    const post = { id: Date.now(), title: text };
    void attempt(
      (list) => [...list, post],
      (list) => list.filter((item) => item.id !== post.id),
      () => api.post('/posts', { title: text, body: '', userId: 1 }),
    );
  };

  const remove = (post: Post) => {
    const index = current().findIndex((item) => item.id === post.id);
    void attempt(
      (list) => list.filter((item) => item.id !== post.id),
      (list) => [...list.slice(0, index), post, ...list.slice(index)],
      () => api.delete(`/posts/${post.id}`),
    );
  };

  return em.Posts(
    { css },
    form(
      { onsubmit: add },
      input({
        bind: title,
        placeholder: 'Title of a new post',
        'aria-label': 'Title',
        disabled: () => posts.loading,
      }),
      button({ type: 'submit', disabled: () => posts.loading }, 'Add'),
    ),
    p(() => posts.loading && 'Loading...'),
    ul(
      each(
        current,
        (post) =>
          li(
            span(post.title),
            button(
              { type: 'button', disabled: () => posts.loading, onclick: () => remove(post) },
              'Delete',
            ),
          ),
        { by: (post) => post.id },
      ),
    ),
    p({ class: 'error' }, problem),
    small(() => `${requests.value} requests, the last one took ${last.value} ms`),
  );
};
