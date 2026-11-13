import { createHttp, em, signal, tags, type HttpError } from 'ecmact';

const { a, div, input, p, small } = tags;

const css = `
  :host { display: block; }
  input {
    box-sizing: border-box;
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

  const info = api.resource<Repository>(() => `/repos/${repo.value}`);

  const failure = () => {
    const { status, code } = info.error as HttpError;
    return messages[status ?? 0] ?? `Request failed (${code}).`;
  };

  return em.GitHub(
    { css },
    input({
      value: repo.value,
      'aria-label': 'Repository, owner/name',
      placeholder: 'owner/name',
      oninput: (event) => {
        clearTimeout(pause);
        const { value } = event.target as HTMLInputElement;
        pause = setTimeout(() => (repo.value = value.trim()), 400);
      },
    }),
    div({ class: 'card' }, () => {
      const found = info.data;
      if (info.error) return p({ class: 'error' }, failure());
      if (!found) return p('Loading...');
      return [
        a({ href: found.html_url, target: '_blank', rel: 'noreferrer' }, found.full_name),
        p(found.description ?? 'No description.'),
        p(
          { class: 'stats' },
          `★ ${found.stargazers_count}   ⑂ ${found.forks_count}   ${found.open_issues_count} open issues`,
        ),
      ];
    }),
    small(() => left.value && `API calls left this hour: ${left.value}`),
  );
};
