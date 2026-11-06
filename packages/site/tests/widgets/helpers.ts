import { vi } from 'vitest';

/**
 * Mounts a widget on the page and waits for it to render.
 *
 * @param name - The tag of the widget.
 * @param attributes - Its attributes.
 * @returns The element and a reader of its shadow root.
 */
export const mountWidget = async (name: string, attributes: Record<string, string> = {}) => {
  const element = document.createElement(name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  document.body.append(element);
  await vi.advanceTimersByTimeAsync(0);
  const root = element.shadowRoot as ShadowRoot;
  return { element, root, text: () => root.textContent ?? '' };
};

/**
 * Replaces `fetch` with a function that answers from a table of address fragments.
 *
 * @param answers - A function that returns a body for an address, or a status to fail with.
 * @returns The mock.
 */
export const stubFetch = (answers: (url: string) => unknown) => {
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const body = answers(String(input));
    if (typeof body === 'number') {
      return new Response('{}', { status: body, headers: { 'content-type': 'application/json' } });
    }
    const extra = (body as { __headers?: Record<string, string> } | null)?.__headers ?? {};
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json', ...extra },
    });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
};
