import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/github';
import { stubFetch } from '@tests/widgets/helpers';

const repository = (name: string) => ({
  full_name: name,
  description: null,
  html_url: `https://github.com/${name}`,
  stargazers_count: 5,
  forks_count: 2,
  open_issues_count: 1,
  __headers: { 'x-ratelimit-remaining': '42' },
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await vi.advanceTimersByTimeAsync(10);
  const root = demo.shadowRoot!;
  return { root, text: () => root.textContent! };
};

describe('github demo', () => {
  it('shows the repository and the rate limit that an interceptor read', async () => {
    const fetchMock = stubFetch((url) => repository(url.split('/repos/')[1]!));
    const { text, root } = await open();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/eternalvision/ecmact');
    expect(text()).toContain('eternalvision/ecmact');
    expect(text()).toContain('★ 5');
    expect(text()).toContain('No description.');
    expect(text()).toContain('API calls left this hour: 42');
    expect(root.querySelector('a')?.getAttribute('href')).toBe(
      'https://github.com/eternalvision/ecmact',
    );
  });

  it('asks for another repository after a pause in typing', async () => {
    const fetchMock = stubFetch((url) => {
      const { __headers, ...bare } = repository(url.split('/repos/')[1]!);
      return __headers && url.endsWith('ecmact') ? { ...bare, __headers } : bare;
    });
    const { root, text } = await open();
    const input = root.querySelector('input')!;
    input.value = 'a/b';
    input.dispatchEvent(new Event('input'));
    input.value = 'a/bc';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(text()).toContain('a/bc');
    expect(text()).not.toContain('API calls left');
  });

  it('explains the failures it knows and the ones it does not', async () => {
    let status = 404;
    stubFetch(() => status);
    const { root, text } = await open();
    expect(text()).toContain('No such repository.');
    const input = root.querySelector('input')!;
    status = 403;
    input.value = 'x/y';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(410);
    expect(text()).toContain('GitHub rate limit reached.');
    status = 418;
    input.value = 'x/z';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(410);
    expect(text()).toContain('Request failed');
  });

  it('names the code of a failure that has no status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const { text } = await open();
    await vi.advanceTimersByTimeAsync(3000);
    expect(text()).toContain('Request failed (ERR_NETWORK)');
  });
});
