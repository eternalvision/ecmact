import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/github';
import { stubFetch } from '@tests/widgets/helpers';

const repository = (name: string, remaining = '42') => ({
  full_name: name,
  description: null,
  html_url: `https://github.com/${name}`,
  stargazers_count: 5,
  forks_count: 2,
  open_issues_count: 1,
  __headers: { 'x-ratelimit-remaining': remaining },
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
  return {
    root,
    text: () => root.textContent!,
    footer: () => root.querySelector('small')?.textContent,
    result: () => root.querySelector<HTMLElement>('.card > em-div > div'),
    type: async (name: string) => {
      const input = root.querySelector('input')!;
      input.value = name;
      input.dispatchEvent(new Event('input'));
      await vi.advanceTimersByTimeAsync(410);
    },
  };
};

describe('github demo', () => {
  it('shows the repository and the rate limit that an interceptor read', async () => {
    const fetchMock = stubFetch((url) => repository(url.split('/repos/')[1]!));
    const { text, root, footer } = await open();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/repos/eternalvision/ecmact');
    expect(text()).toContain('eternalvision/ecmact');
    expect(text()).toContain('★ 5');
    expect(text()).toContain('No description.');
    expect(footer()).toBe('API calls left this hour: 42');
    expect(root.querySelector('a')?.getAttribute('href')).toBe(
      'https://github.com/eternalvision/ecmact',
    );
  });

  it('asks for another repository after a pause in typing', async () => {
    const fetchMock = stubFetch((url) => repository(url.split('/repos/')[1]!, '41'));
    const { root, text, footer } = await open();
    const input = root.querySelector('input')!;
    input.value = 'a/b';
    input.dispatchEvent(new Event('input'));
    input.value = 'a/bc';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(text()).toContain('a/bc');
    expect(footer()).toBe('API calls left this hour: 41');
  });

  it('has no counter when the answer carries no rate-limit header', async () => {
    stubFetch((url) => ({ ...repository(url.split('/repos/')[1]!), __headers: {} }));
    const { footer } = await open();
    expect(footer()).toBe('');
  });

  it('explains the failures it knows and the ones it does not', async () => {
    let status = 404;
    stubFetch(() => status);
    const { text, type } = await open();
    expect(text()).toContain('No such repository.');
    status = 403;
    await type('x/y');
    expect(text()).toContain('GitHub rate limit reached.');
    status = 418;
    await type('x/z');
    expect(text()).toContain('Request failed');
  });

  it('reads the rate limit from a failed answer too, because that is when it matters', async () => {
    let answer: unknown = repository('a/b', '58');
    stubFetch(() => answer);
    const { footer, type, text } = await open();
    expect(footer()).toBe('API calls left this hour: 58');
    answer = { __status: 403, __headers: { 'x-ratelimit-remaining': '0' } };
    await type('x/y');
    expect(text()).toContain('GitHub rate limit reached.');
    expect(footer()).toBe('API calls left this hour: 0');
    answer = { __status: 404 };
    await type('x/z');
    expect(footer()).toBe('API calls left this hour: 0');
  });

  it('does not show the result of an older lookup beside a failure, or while loading', async () => {
    let answer: unknown = repository('a/b');
    stubFetch(() => answer);
    const { result, type } = await open();
    expect(getComputedStyle(result()!).display).not.toBe('none');
    answer = 404;
    await type('x/y');
    expect(result()!.hasAttribute('hidden')).toBe(true);
    expect(getComputedStyle(result()!).display).toBe('none');
  });

  it('names the code of a failure that has no status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const { text, footer } = await open();
    await vi.advanceTimersByTimeAsync(3000);
    expect(text()).toContain('Request failed (ERR_NETWORK)');
    expect(footer()).toBe('');
  });
});
