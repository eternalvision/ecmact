import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineRepoCard, isRepository } from '@site/widgets/repoCard';
import { mountWidget, stubFetch } from '@tests/widgets/helpers';

defineRepoCard();

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
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/**
 * Reads the parts of the card.
 *
 * @param root - The shadow root.
 * @returns The name, the link, the description, the numbers and whether the error is shown.
 */
const card = (root: ShadowRoot) => {
  const link = root.querySelector('a.name');
  return {
    name: link?.textContent,
    href: link?.getAttribute('href') ?? null,
    target: link?.getAttribute('target') ?? null,
    about: root.querySelector('.about')?.textContent,
    stats: [...root.querySelectorAll('.stats span')]
      .filter((item) => !item.hasAttribute('hidden') && item.textContent !== '')
      .map((item) => item.textContent),
    failed: root.querySelector('.error')?.hasAttribute('hidden') === false,
    message: root.querySelector('.error .state')?.textContent,
  };
};

describe('isRepository', () => {
  it('accepts owner/name and nothing else', () => {
    expect(isRepository('eternalvision/ecmact')).toBe(true);
    expect(isRepository('a.b-c/d_e.f')).toBe(true);
    expect(isRepository('octo/.github')).toBe(true);
    expect(isRepository('vitejs/vite/issues')).toBe(false);
    expect(isRepository('vite')).toBe(false);
    expect(isRepository('')).toBe(false);
    expect(isRepository('../..')).toBe(false);
    expect(isRepository('a/..')).toBe(false);
    expect(isRepository('./b')).toBe(false);
    expect(isRepository('a/b?x=1')).toBe(false);
    expect(isRepository('a/b#c')).toBe(false);
    expect(isRepository('a /b')).toBe(false);
  });
});

describe('repo-card', () => {
  it('shows the numbers of a repository and announces them once', async () => {
    const fetchMock = stubFetch(() => repository);
    const loaded = vi.fn();
    const { root } = await mountWidget('repo-card', {}, { loaded: (e) => loaded(e.detail) });
    await vi.advanceTimersByTimeAsync(10);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/eternalvision/ecmact');
    expect(card(root)).toMatchObject({
      name: 'eternalvision/ecmact',
      href: repository.html_url,
      target: '_blank',
      about: 'Web Components',
      stats: ['★ 12.3K stars', '⑂ 3 forks', '1.2K issues', 'TypeScript', 'MIT'],
      failed: false,
    });
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(loaded).toHaveBeenCalledWith({ repo: 'eternalvision/ecmact', stars: 12345 });
  });

  it('reads the repository from its attribute and shows a missing description', async () => {
    const fetchMock = stubFetch(() => ({
      ...repository,
      description: null,
      language: null,
      license: null,
    }));
    const { root } = await mountWidget('repo-card', { repo: 'a/b' });
    await vi.advanceTimersByTimeAsync(10);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://api.github.com/repos/a/b');
    expect(card(root).about).toBe('No description.');
    expect(card(root).stats).toEqual(['★ 12.3K stars', '⑂ 3 forks', '1.2K issues']);
  });

  it('uses the default repository for an empty attribute', async () => {
    const fetchMock = stubFetch(() => repository);
    await mountWidget('repo-card', { repo: '  ' });
    await vi.advanceTimersByTimeAsync(10);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/eternalvision/ecmact');
  });

  it('does not request anything for text that is not owner/name', async () => {
    const fetchMock = stubFetch(() => [repository]);
    const { root } = await mountWidget('repo-card', { repo: 'vitejs/vite/issues' });
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(card(root)).toMatchObject({ failed: true, message: 'Use the form owner/name.' });
  });

  it('has no link to follow while it loads or after it failed', async () => {
    stubFetch(() => 404);
    const { root } = await mountWidget('repo-card', { repo: 'nobody/none' });
    expect(card(root)).toMatchObject({ name: 'nobody/none', href: null, target: null });
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ name: 'nobody/none', href: null, target: null });
  });

  it('says what went wrong and tries again', async () => {
    let status: number | typeof repository = 404;
    const fetchMock = stubFetch(() => status);
    const { root } = await mountWidget('repo-card');
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root).message).toBe('Not found.');
    status = repository;
    root.querySelector<HTMLButtonElement>('.error button')!.click();
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(card(root)).toMatchObject({
      failed: false,
      stats: expect.arrayContaining(['★ 12.3K stars']),
    });
  });

  it('shows Loading until the first answer', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    const { root } = await mountWidget('repo-card');
    expect(card(root).about).toBe('Loading...');
  });

  it('does not show the old repository beside the message that a newer request failed', async () => {
    stubFetch((url) => (url.endsWith('nobody/none') ? 404 : repository));
    const { element, root } = await mountWidget('repo-card', { repo: 'good/repo' });
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root).stats).toContain('★ 12.3K stars');
    element.setAttribute('repo', 'nobody/none');
    await vi.advanceTimersByTimeAsync(10);
    expect(card(root)).toMatchObject({ name: 'nobody/none', stats: [], failed: true });
  });

  it('stops its request when removed, and loads and announces again when put back', async () => {
    const fetchMock = stubFetch(() => repository);
    const loaded = vi.fn();
    const { element } = await mountWidget('repo-card', {}, { loaded: (e) => loaded(e.detail) });
    await vi.advanceTimersByTimeAsync(10);
    element.remove();
    element.setAttribute('repo', 'a/b');
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    document.body.append(element);
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/repos/a/b');
    expect(loaded).toHaveBeenCalledTimes(2);
  });

  it('does not announce the same data twice when put back and nothing changed', async () => {
    stubFetch(() => repository);
    const loaded = vi.fn();
    const { element } = await mountWidget('repo-card', {}, { loaded: (e) => loaded(e.detail) });
    await vi.advanceTimersByTimeAsync(10);
    element.remove();
    expect(loaded).toHaveBeenCalledTimes(1);
  });
});
