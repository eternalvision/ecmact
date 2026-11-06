import { vi } from 'vitest';

export interface Call {
  url: string;
  init: RequestInit & { headers: Headers };
}

export const reply = (body: BodyInit | null = '', init: ResponseInit = {}) =>
  new Response(body, { status: 200, ...init });

export const json = (value: unknown, init: ResponseInit = {}) =>
  reply(JSON.stringify(value), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });

export const fake = (
  respond: (call: Call) => Response | Promise<Response> = () => json({ ok: true }),
) => {
  const calls: Call[] = [];
  const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(url), init: init as Call['init'] };
    calls.push(call);
    return respond(call);
  });
  return { calls, fetch: fetcher as unknown as typeof fetch };
};
