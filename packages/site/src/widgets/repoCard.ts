import { computed, defineWidget, effect, untracked } from 'ecmact';
import { api, describeError } from '@site/widgets/api';
import { attachedResource, compact, part, sheet, tag } from '@site/widgets/kit';

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
  .pill { margin-inline-start: auto; padding: 0 0.5rem; border: 1px solid var(--w-border, #30363d); border-radius: 999px; font-size: 0.72rem; color: var(--w-muted, #7d8590); }
  .about { margin: 0.7rem 0 1rem; color: var(--w-muted, #7d8590); font-size: 0.92rem; line-height: 1.5; }
  .stats { display: flex; flex-wrap: wrap; gap: 0.4rem 1.1rem; font-size: 0.85rem; color: var(--w-muted, #7d8590); }
  .lang::before { content: ''; display: inline-block; width: 0.65rem; height: 0.65rem; margin-inline-end: 0.35rem; border-radius: 50%; background: var(--w-accent, #4493f8); }
  .state { margin: 0.3rem 0; font-size: 0.92rem; color: var(--w-muted, #7d8590); }
  button { margin-top: 0.4rem; padding: 0.3rem 0.8rem; border: 1px solid var(--w-border, #30363d); border-radius: 6px; background: transparent; color: var(--w-fg, #e6edf3); font: inherit; cursor: pointer; }
  button:hover { border-color: var(--w-accent, #4493f8); }
`;

const octicon =
  'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z';

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
    ({ host, props, emit }) => {
      /**
       * Reads the repository to show: the attribute, or the default.
       *
       * @returns The text.
       */
      const name = () => (props.repo.value ?? '').trim() || 'eternalvision/ecmact';
      const repository = attachedResource<Repository>(({ signal }) => {
        const repo = name();
        if (!isRepository(repo)) throw new Error('Use the form owner/name.');
        return api
          .get<Repository>(`https://api.github.com/repos/${repo}`, {
            headers: { Accept: 'application/vnd.github+json' },
            signal,
          })
          .then((response) => response.data);
      });
      /** The repository to show: not the old one beside the message that a newer request failed. */
      const data = computed(() =>
        repository.error.value === undefined ? repository.data.value : undefined,
      );
      /**
       * Makes a text that follows the repository.
       *
       * @param read - Picks the text out of the repository.
       * @returns The text, empty while there is no repository.
       */
      const text = (read: (value: Repository) => string) =>
        computed(() => (data.value ? read(data.value) : ''));
      let announced: Repository | undefined;

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
        /**
         * Starts the request and announces each repository once it has loaded.
         *
         * @returns The cleanup that stops both.
         */
        mounted: () => {
          const stopLoading = repository.attach();
          const stopAnnouncing = effect(() => {
            const loaded = repository.data.value;
            if (!loaded || loaded === announced) return;
            announced = loaded;
            untracked(() =>
              emit('loaded', { repo: loaded.full_name, stars: loaded.stargazers_count }),
            );
          });
          return () => {
            stopAnnouncing();
            stopLoading();
          };
        },
        children: [
          part(
            'div',
            'head',
            icon,
            tag('a', {
              class: 'name',
              target: computed(() => (data.value ? '_blank' : null)),
              rel: 'noreferrer',
              href: computed(() => data.value?.html_url ?? null),
              content: computed(() => data.value?.full_name ?? name()),
            } as never),
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
                /** Loads the repository again. */
                onclick: () => {
                  repository.refetch();
                },
              }),
            ],
          }),
        ],
      });
      return sheet(host, css, root);
    },
    { attributes: ['repo'] },
  );
