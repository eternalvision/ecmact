import { defineWidget, effect, resource, tags, untracked } from 'ecmact';
import { api, describeError } from '@site/widgets/api';
import { compact, widgetCss } from '@site/widgets/kit';

const { a, button, div, p, span } = tags;

/** What the widget shows about a repository. */
interface Repository {
  /** The full name, `owner/name`. */
  full_name: string;
  /** The description. */
  description: string | null;
  /** The number of stars. */
  stargazers_count: number;
  /** The number of forks. */
  forks_count: number;
  /** The number of open issues. */
  open_issues_count: number;
  /** The main language. */
  language: string | null;
  /** The address of the repository page. */
  html_url: string;
  /** The license, when there is one. */
  license: { spdx_id: string } | null;
}

const css = `
  :host {
    display: block;
    max-width: 26rem;
    font-family: var(--w-font, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif);
  }
  .card {
    padding: 1.1rem 1.2rem;
    border: 1px solid var(--w-border, #30363d);
    border-radius: var(--w-radius, 10px);
    background: var(--w-bg, #0d1117);
    color: var(--w-fg, #e6edf3);
  }
  .head { display: flex; align-items: center; gap: 0.5rem; }
  .icon { display: flex; flex: none; fill: var(--w-muted, #7d8590); }
  a.name { color: var(--w-accent, #4493f8); font-weight: 600; font-size: 1.05rem; text-decoration: none; word-break: break-all; }
  a.name:hover { text-decoration: underline; }
  .pill { margin-inline-start: auto; padding: 0 0.5rem; border: 1px solid var(--w-border, #30363d); border-radius: 999px; font-size: 0.72rem; color: var(--w-muted, #7d8590); }
  .about { margin: 0.7rem 0 1rem; color: var(--w-muted, #7d8590); font-size: 0.92rem; line-height: 1.5; }
  .stats { display: flex; flex-wrap: wrap; gap: 0.4rem 1.1rem; font-size: 0.85rem; color: var(--w-muted, #7d8590); }
  .lang::before { content: ''; display: inline-block; width: 0.65rem; height: 0.65rem; margin-inline-end: 0.35rem; border-radius: 50%; background: var(--w-accent, #4493f8); }
  .state { margin: 0.3rem 0; font-size: 0.92rem; color: var(--w-muted, #7d8590); }
  button { margin-top: 0.4rem; padding: 0.3rem 0.8rem; border: 1px solid var(--w-border, #30363d); border-radius: 6px; background: transparent; color: var(--w-fg, #e6edf3); font: inherit; cursor: pointer; }
  button:hover { border-color: var(--w-accent, #4493f8); }
`;

const octicon = `<svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>`;

/**
 * Tells whether text names a GitHub repository, `owner/name`, with nothing else in it: no further path segments, no
 * `.` or `..`, no characters that could change the address that is requested.
 *
 * @param value - The text.
 * @returns `true` for a safe `owner/name`.
 */
export const isRepository = (value: string) => {
  const parts = value.split('/');
  return (
    parts.length === 2 &&
    parts.every((part) => /^[\w.-]+$/.test(part) && part !== '.' && part !== '..')
  );
};

/**
 * Registers `<repo-card>`: the numbers of a public GitHub repository, from the GitHub API.
 * Attributes: `repo` (`owner/name`, default `eternalvision/ecmact`; anything else shows a message instead of
 * being requested).
 * Event: `loaded` with `{ repo, stars }`.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineRepoCard = () =>
  defineWidget(
    'repo-card',
    ({ props, emit }) => {
      /**
       * Reads the repository to show: the attribute, or the default when it is blank.
       *
       * @returns The text.
       */
      const name = () => props.repo.trim() || 'eternalvision/ecmact';
      const repository = resource(({ signal }) => {
        const repo = name();
        if (!isRepository(repo)) throw new Error('Use the form owner/name.');
        return api.get<Repository>(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal,
        }).data;
      });
      /**
       * Reads the repository to show: not the old one beside the message that a newer request failed.
       *
       * @returns The repository, or `undefined`.
       */
      const shown = () => (repository.error === undefined ? repository.data : undefined);

      effect(() => {
        const loaded = repository.data;
        if (!loaded) return;
        untracked(() => emit('loaded', { repo: loaded.full_name, stars: loaded.stargazers_count }));
      });

      return div(
        { class: 'card' },
        div(
          { class: 'head' },
          span({ class: 'icon', 'aria-hidden': 'true', html: octicon }),
          a(
            {
              class: 'name',
              rel: 'noreferrer',
              /**
               * Gives the link an address once there is a repository to open.
               *
               * @returns The address of the repository page, or `undefined`.
               */
              href: () => shown()?.html_url,
              /**
               * Opens the repository in a new tab.
               *
               * @returns `_blank` once there is a repository to open.
               */
              target: () => shown() && '_blank',
            },
            () => shown()?.full_name ?? name(),
          ),
          span({ class: 'pill' }, 'Public'),
        ),
        p({ class: 'about' }, () => {
          const repo = shown();
          if (repo) return repo.description ?? 'No description.';
          return repository.loading && 'Loading...';
        }),
        () => {
          const repo = shown();
          return (
            repo &&
            div(
              { class: 'stats' },
              span(`★ ${compact(repo.stargazers_count)} stars`),
              span(`⑂ ${compact(repo.forks_count)} forks`),
              span(`${compact(repo.open_issues_count)} issues`),
              repo.language && span({ class: 'lang' }, repo.language),
              repo.license && span(repo.license.spdx_id),
            )
          );
        },
        () =>
          repository.error !== undefined &&
          div(
            { class: 'error' },
            p({ class: 'state' }, describeError(repository.error)),
            button({ type: 'button', onclick: repository.refetch }, 'Try again'),
          ),
      );
    },
    { attributes: { repo: 'eternalvision/ecmact' }, css: widgetCss(css) },
  );
