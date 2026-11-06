import { computed, createHttp, em, resource, signal, tags, type HttpError } from 'ecmact';

const css = `
  :host, div { display: block; }
  [hidden] { display: none !important; }
  input {
    width: 100%;
    padding: 0.55rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }
  .card { margin-top: 0.8rem; min-height: 6.2rem; }
  a { color: var(--primary-bright); font-weight: 600; }
  p { margin: 0.35rem 0; color: var(--muted); }
  .stats { color: var(--text); }
  .error { color: var(--danger); }
  small { display: block; margin-top: 0.7rem; color: var(--muted); }
`;

/** What the demo shows about a repository. */
interface Repository {
  /** The full name, `owner/name`. */
  full_name: string;
  /** The description. */
  description: string | null;
  /** The address of the repository page. */
  html_url: string;
  /** The number of stars. */
  stargazers_count: number;
  /** The number of forks. */
  forks_count: number;
  /** The number of open issues. */
  open_issues_count: number;
}

const messages: Record<number, string> = {
  404: 'No such repository.',
  403: 'GitHub rate limit reached. Try again later.',
  429: 'GitHub rate limit reached. Try again later.',
};

/**
 * A repository card from the GitHub API. Type a name and the request goes out after a short pause; a request that
 * a newer one replaces is aborted. A response interceptor reads the rate-limit header of every answer, failed ones
 * included, because a rate-limited answer is exactly when it matters.
 *
 * @returns The demo.
 */
export const create = () => {
  const repo = signal('eternalvision/ecmact');
  const left = signal('');
  let pause: ReturnType<typeof setTimeout> | undefined;

  const api = createHttp({
    baseURL: 'https://api.github.com',
    timeout: 8000,
    headers: { common: { Accept: 'application/vnd.github+json' } },
  });
  api.interceptors.response.use(
    (response) => {
      left.value = response.headers['x-ratelimit-remaining'] ?? '';
      return response;
    },
    (error) => {
      left.value = (error as HttpError).response?.headers['x-ratelimit-remaining'] ?? left.value;
      return Promise.reject(error);
    },
  );

  const info = resource(({ signal: aborted }) =>
    api
      .get<Repository>(`/repos/${repo.value}`, { signal: aborted })
      .then((response) => response.data),
  );
  const failure = computed(() => {
    const error = info.error.value;
    if (!error) return '';
    const { status, code } = error as HttpError;
    return messages[status ?? 0] ?? `Request failed (${code}).`;
  });
  const data = info.data;

  return em.GitHub({
    shadow: true,
    css,
    children: [
      tags.input({
        shadow: false,
        value: 'eternalvision/ecmact',
        'aria-label': 'Repository, owner/name',
        placeholder: 'owner/name',
        oninput: (event) => {
          clearTimeout(pause);
          const value = (event.target as HTMLInputElement).value.trim();
          pause = setTimeout(() => (repo.value = value), 400);
        },
      }),
      tags.div({
        shadow: false,
        class: 'card',
        children: [
          tags.p({
            shadow: false,
            content: 'Loading...',
            hidden: computed(() => !info.loading.value || !!data.value),
          }),
          tags.div({
            shadow: false,
            hidden: computed(() => !data.value || !!info.error.value),
            children: [
              tags.a({
                shadow: false,
                target: '_blank',
                rel: 'noreferrer',
                href: computed(() => data.value?.html_url ?? '#'),
                content: computed(() => data.value?.full_name ?? ''),
              }),
              tags.p({
                shadow: false,
                content: computed(() => data.value?.description ?? 'No description.'),
              }),
              tags.p({
                shadow: false,
                class: 'stats',
                content: computed(() => {
                  const value = data.value;
                  return value
                    ? `★ ${value.stargazers_count}   ⑂ ${value.forks_count}   ${value.open_issues_count} open issues`
                    : '';
                }),
              }),
            ],
          }),
          tags.p({
            shadow: false,
            class: 'error',
            content: failure,
            hidden: computed(() => !failure.value),
          }),
          tags.small({
            shadow: false,
            content: computed(() => (left.value ? `API calls left this hour: ${left.value}` : '')),
          }),
        ],
      }),
    ],
  });
};
