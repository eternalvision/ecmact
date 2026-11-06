import { computed, defineWidget, effect, resource } from 'ecmact';
import { tag } from '@site/lib/component';
import { api, describeError } from '@site/widgets/api';
import { part, sheet } from '@site/widgets/kit';

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
  .head svg { flex: none; fill: var(--w-muted, #7d8590); }
  a.name { color: var(--w-accent, #4493f8); font-weight: 600; font-size: 1.05rem; text-decoration: none; word-break: break-all; }
  a.name:hover { text-decoration: underline; }
  .pill { margin-left: auto; padding: 0 0.5rem; border: 1px solid var(--w-border, #30363d); border-radius: 999px; font-size: 0.72rem; color: var(--w-muted, #7d8590); }
  .about { margin: 0.7rem 0 1rem; color: var(--w-muted, #7d8590); font-size: 0.92rem; line-height: 1.5; }
  .stats { display: flex; flex-wrap: wrap; gap: 0.4rem 1.1rem; font-size: 0.85rem; color: var(--w-muted, #7d8590); }
  .stats b { color: var(--w-fg, #e6edf3); font-weight: 600; }
  .lang::before { content: ''; display: inline-block; width: 0.65rem; height: 0.65rem; margin-right: 0.35rem; border-radius: 50%; background: var(--w-accent, #4493f8); }
  .state { margin: 0.3rem 0; font-size: 0.92rem; color: var(--w-muted, #7d8590); }
  button { margin-top: 0.4rem; padding: 0.3rem 0.8rem; border: 1px solid var(--w-border, #30363d); border-radius: 6px; background: transparent; color: var(--w-fg, #e6edf3); font: inherit; cursor: pointer; }
  button:hover { border-color: var(--w-accent, #4493f8); }
`;

const octicon =
  'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z';

/**
 * Formats a count: 1 234 as `1.2k`.
 *
 * @param value - The count.
 * @returns The short text.
 */
export const compact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value);

/**
 * Registers `<repo-card>`: the numbers of a public GitHub repository, from the GitHub API.
 * Attributes: `repo` (`owner/name`, default `eternalvision/ecmact`).
 * Event: `loaded` with `{ repo, stars }`.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const defineRepoCard = () =>
  defineWidget(
    'repo-card',
    ({ props, emit }) => {
      const repository = resource<Repository>(({ signal }) =>
        api
          .get<Repository>(
            `https://api.github.com/repos/${props.repo.value ?? 'eternalvision/ecmact'}`,
            {
              headers: { Accept: 'application/vnd.github+json' },
              signal,
            },
          )
          .then((response) => response.data),
      );
      const data = repository.data;
      const text = (read: (value: Repository) => string) =>
        computed(() => (data.value ? read(data.value) : ''));

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('viewBox', '0 0 16 16');
      icon.setAttribute('width', '16');
      icon.setAttribute('height', '16');
      icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', octicon);
      icon.append(path);

      const root = tag('div', {
        class: 'card',
        mounted: () =>
          effect(() => {
            if (data.value)
              emit('loaded', { repo: data.value.full_name, stars: data.value.stargazers_count });
          }),
        children: [
          part(
            'div',
            'head',
            icon,
            tag('a', {
              class: 'name',
              target: '_blank',
              rel: 'noreferrer',
              href: computed(() => data.value?.html_url ?? '#'),
              content: computed(
                () => data.value?.full_name ?? props.repo.value ?? 'eternalvision/ecmact',
              ),
            }),
            tag('span', { class: 'pill', content: 'Public' }),
          ),
          tag('p', {
            class: 'about',
            content: computed(() =>
              data.value
                ? (data.value.description ?? 'No description.')
                : repository.loading.value
                  ? 'Loading...'
                  : '',
            ),
          }),
          tag('div', {
            class: 'stats',
            hidden: computed(() => !data.value),
            children: [
              tag('span', {
                content: text((value) => `★ ${compact(value.stargazers_count)} stars`),
              }),
              tag('span', { content: text((value) => `⑂ ${compact(value.forks_count)} forks`) }),
              tag('span', {
                content: text((value) => `${compact(value.open_issues_count)} issues`),
              }),
              tag('span', {
                class: 'lang',
                content: text((value) => value.language ?? ''),
                hidden: computed(() => !data.value?.language),
              }),
              tag('span', {
                content: text((value) => value.license?.spdx_id ?? ''),
                hidden: computed(() => !data.value?.license),
              }),
            ],
          }),
          tag('div', {
            class: 'error',
            hidden: computed(() => repository.error.value === undefined),
            children: [
              tag('p', {
                class: 'state',
                content: computed(() => describeError(repository.error.value)),
              }),
              tag('button', {
                type: 'button',
                content: 'Try again',
                onclick: () => repository.refetch(),
              }),
            ],
          }),
        ],
      });
      return sheet(css, root);
    },
    { attributes: ['repo'] },
  );
