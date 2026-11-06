import { vi } from 'vitest';

/**
 * Reads the text that a visitor could see in a widget: the text of its elements, without the `style` elements and
 * without anything under a `hidden` element.
 *
 * @param node - The node to read, normally the shadow root of a widget.
 * @returns The text.
 */
export const visibleText = (node: Node): string => {
  if (node instanceof Element && (node.localName === 'style' || node.hasAttribute('hidden'))) {
    return '';
  }
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  return [...node.childNodes].map(visibleText).join('');
};

/**
 * Mounts a widget on the page and waits for it to render.
 *
 * @param name - The tag of the widget.
 * @param attributes - Its attributes.
 * @param listeners - Listeners to add before the widget is mounted, by event name.
 * @returns The element, its shadow root and a reader of the text that can be seen.
 */
export const mountWidget = async (
  name: string,
  attributes: Record<string, string> = {},
  listeners: Record<string, (event: CustomEvent) => void> = {},
) => {
  const element = document.createElement(name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  Object.entries(listeners).forEach(([type, listener]) =>
    element.addEventListener(type, listener as EventListener),
  );
  document.body.append(element);
  await vi.advanceTimersByTimeAsync(0);
  const root = element.shadowRoot as ShadowRoot;
  return { element, root, text: () => visibleText(root) };
};

/**
 * Replaces `fetch` with a function that answers from a function of the address.
 *
 * @param answers - Returns the body for an address; a number answers with that status and an empty body; an object
 * with `__status` or `__headers` sets the status and the headers of the answer, and the rest is the body.
 * @returns The mock.
 */
export const stubFetch = (answers: (url: string) => unknown) => {
  const mock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const answer = answers(String(input));
    const plain = typeof answer === 'number' ? { __status: answer } : answer;
    const meta = (typeof plain === 'object' && plain !== null ? plain : {}) as {
      __status?: number;
      __headers?: Record<string, string>;
    };
    const marked = '__status' in meta || '__headers' in meta;
    const { __status = 200, __headers = {}, ...rest } = meta;
    return new Response(JSON.stringify(marked ? rest : plain), {
      status: __status,
      headers: { 'content-type': 'application/json', ...__headers },
    });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
};
