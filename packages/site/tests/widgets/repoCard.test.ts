import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { compact, defineRepoCard } from '@site/widgets/repoCard';
import { mountWidget, stubFetch } from '@tests/widgets/helpers';

const repository = {
  full_name: 'eternalvision/ecmact',
  description: 'Web Components',
  stargazers_count: 12345,
  forks_count: 3,
  open_issues_count: 1200,
  language: 'TypeScript',
  html_url: 'https://github.com/eternalvision/ecmact',
  license: { spdx_id: 'MIT' },
};

beforeEach(() => {
  vi.useFakeTimers();
  if (!customElements.get('repo-card')) defineRepoCard();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('compact', () => {
  it('shortens thousands', () => {
    expect(compact(950)).toBe('950');
    expect(compact(1234)).toBe('1.2k');
    expect(compact(12345)).toBe('12k');
  });
});

describe('repo-card', () => {
  it('shows the numbers of a repository and announces them', async () => {
    const fetchMock = stubFetch(() => repository);
    const { element, root, text } = await (async () => {
      const element = document.createElement('repo-card');
      const loaded = vi.fn();
      element.addEventListener('loaded', loaded);
      document.body.append(element);
      await vi.advanceTimersByTimeAsync(10);
      return {
        element,
        root: element.shadowRoot!,
        text: () => element.shadowRoot!.textContent!,
        loaded,
      };
    })();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/eternalvision/ecmact');
    expect(text()).toContain('eternalvision/ecmact');
    expect(text()).toContain('12k stars');
    expect(text()).toContain('1.2k issues');
    expect(text()).toContain('TypeScript');
    expect(text()).toContain('MIT');
    expect(root.querySelector('a.name')?.getAttribute('href')).toBe(repository.html_url);
    expect(element.isConnected).toBe(true);
  });

  it('reads the repository from its attribute and shows a missing description', async () => {
    const fetchMock = stubFetch(() => ({
      ...repository,
      description: null,
      language: null,
      license: null,
    }));
    const { text } = await mountWidget('repo-card', { repo: 'a/b' });
    await vi.advanceTimersByTimeAsync(10);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/a/b');
    expect(text()).toContain('No description.');
  });

  it('says what went wrong and tries again', async () => {
    let status: number | typeof repository = 404;
    const fetchMock = stubFetch(() => status);
    const { root, text } = await mountWidget('repo-card');
    await vi.advanceTimersByTimeAsync(10);
    expect(text()).toContain('Not found.');
    status = repository;
    [...root.querySelectorAll('button')].find((b) => b.textContent === 'Try again')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(text()).toContain('12k stars');
  });
});
