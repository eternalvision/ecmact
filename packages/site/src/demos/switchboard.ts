import { createHttp, em, signal, tags, type HttpError } from 'ecmact';

const { button, div, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 20px;
    background: linear-gradient(#ece5d0, #ddd4b9);
    box-shadow: inset 0 0 0 6px #c9bf9f;
    color: #2b2a26;
    font: 11px/1.4 'Gill Sans', 'Trebuchet MS', Arial, sans-serif;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .jacks {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    text-align: center;
  }
  .lamp {
    width: 16px;
    height: 16px;
    margin: 0 auto 8px;
    border-radius: 50%;
    background: #8d8672;
    box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.4);
  }
  .ringing .lamp {
    background: #ffb52e;
    box-shadow: 0 0 10px #ffb52e;
  }
  .ok .lamp {
    background: #5fd16a;
    box-shadow: 0 0 10px #5fd16a;
  }
  .bad .lamp {
    background: #ef4b3c;
    box-shadow: 0 0 10px #ef4b3c;
  }
  .cut .lamp {
    background: #5b5648;
  }
  @media (prefers-reduced-motion: no-preference) {
    .ringing .lamp {
      animation: ring 0.8s ease-in-out infinite alternate;
    }
    @keyframes ring {
      to {
        opacity: 0.45;
      }
    }
  }
  .jack {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
  }
  .disc {
    display: block;
    width: 44px;
    height: 44px;
    margin: 0 auto 6px;
    border: 5px solid #9b9482;
    border-radius: 50%;
    background: radial-gradient(#000 38%, #3b3a36 40%);
    box-shadow: 0 2px 0 #fff8;
  }
  .jack[aria-pressed='true'] .disc {
    border-color: #2b2a26;
    transform: translateY(2px);
  }
  .jack:focus-visible {
    outline: 3px solid #2b2a26;
    outline-offset: 3px;
  }
  .name {
    display: block;
    overflow-wrap: anywhere;
  }
  .strip {
    margin-top: 14px;
    padding: 8px 10px;
    min-height: 54px;
    background: #fffdf4;
    border: 1px solid #b9b095;
    font: 12px/1.5 ui-monospace, Menlo, monospace;
    letter-spacing: 0;
    text-transform: none;
  }
  .strip p {
    margin: 0 0 4px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 480px) {
    :host {
      padding: 14px 12px;
      letter-spacing: 0.06em;
    }
    .jacks {
      gap: 4px;
    }
  }
`;

/** One of the four lines of the exchange. */
interface Line {
  /** The name on the jack. */
  name: string;
  /** The address the call asks for. */
  path: string;
}

const lines: Line[] = [
  { name: 'Clear', path: '/line/1' },
  { name: 'Slow', path: '/line/2' },
  { name: 'Crackly', path: '/line/3' },
  { name: 'Dead', path: '/line/4' },
];

/** What a lamp shows: waiting, answered, refused, or cut by hand. */
type Lamp = 'idle' | 'ringing' | 'ok' | 'bad' | 'cut';

/** How a line answers an attempt: after how long, and with which status, or `null` for noise. */
type Ring = (attempt: number) => { after: number; status: number | null };

const exchange: Record<string, Ring> = {
  '/line/1': () => ({ after: 400, status: 200 }),
  '/line/2': () => ({ after: 600000, status: 200 }),
  '/line/3': (attempt) => ({ after: 200, status: attempt < 3 ? null : 200 }),
  '/line/4': () => ({ after: 200, status: 503 }),
};

/**
 * Makes the exchange: a function with the shape of `fetch` that answers the four lines. It is passed to
 * `createHttp`, so the example needs no network and every call ends the same way on every run. Like the real
 * `fetch` it stops when its signal aborts.
 *
 * @param trail - Where it writes what happened on each attempt, by line.
 * @returns The `fetch` of the exchange.
 */
const makeExchange =
  (trail: Record<string, string[]>): typeof fetch =>
  (input, init) =>
    new Promise<Response>((resolve, reject) => {
      const signal = (init as RequestInit).signal as AbortSignal;
      const path = String(input);
      const history = trail[path] as string[];
      const { after, status } = (exchange[path] as Ring)(history.length + 1);
      const cut = () => reject(new DOMException('The plug was pulled', 'AbortError'));
      if (signal.aborted) return cut();
      const timer = setTimeout(() => {
        history.push(status === null ? 'failed' : String(status));
        if (status === null) return reject(new TypeError('Failed to fetch'));
        resolve(
          new Response(JSON.stringify({ status }), {
            status,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }, after);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        cut();
      });
    });

/**
 * A telephone exchange with four lines, and four fates of a request: answered, cancelled by hand and never
 * retried, answered on the third attempt, refused with 503 after the retries. The exchange is a function that
 * `createHttp` gets as its `fetch`. Interceptors write the strip: the response one for an answer, the error one
 * for a refusal or a cancellation, in the same place.
 *
 * @returns The example.
 */
export const create = () => {
  const lamps = signal<Record<string, Lamp>>({});
  const log = signal<string[]>([]);
  const plugs = new Map<string, AbortController>();
  const trail: Record<string, string[]> = {};

  const api = createHttp({ fetch: makeExchange(trail), retry: { retries: 2, delay: 300 } });

  /**
   * Adds a line to the strip. It keeps the last four.
   *
   * @param text - The line.
   */
  const say = (text: string) => {
    log.value = [...log.value, text].slice(-4);
  };

  api.interceptors.response.use(
    (response) => {
      const path = response.config.url as string;
      const tries = trail[path] as string[];
      say(
        `GET ${path} ... ` +
          (tries.length === 1
            ? `${response.status} after ${Math.round(response.duration)} ms.`
            : `${tries.slice(0, -1).join(', ')}, ${response.status} on attempt ${tries.length} of ${tries.length}.`),
      );
      return response;
    },
    (error) => {
      const { code, config, status } = error as HttpError;
      const path = config.url as string;
      say(
        `GET ${path} ... ` +
          (code === 'ERR_CANCELED'
            ? 'ERR_CANCELED, nothing retried.'
            : `${(trail[path] as string[]).join(', ')}: refused with status ${status} after 2 retries. HttpError.`),
      );
      return Promise.reject(error);
    },
  );

  /**
   * Plugs into a line, or pulls the plug of a line that is ringing.
   *
   * @param line - The line.
   */
  const toggle = ({ name, path }: Line) => {
    const plug = plugs.get(name);
    if (plug) {
      plug.abort();
      return;
    }
    const controller = new AbortController();
    plugs.set(name, controller);
    trail[path] = [];
    lamps.value = { ...lamps.value, [name]: 'ringing' };
    api.get(path, { signal: controller.signal }).then(
      () => {
        lamps.value = { ...lamps.value, [name]: 'ok' };
        plugs.delete(name);
      },
      (error: HttpError) => {
        lamps.value = { ...lamps.value, [name]: error.code === 'ERR_CANCELED' ? 'cut' : 'bad' };
        plugs.delete(name);
      },
    );
  };

  return em.Switchboard(
    { css },
    div(
      { class: 'jacks' },
      lines.map((line) =>
        div(
          { class: () => `line ${lamps.value[line.name] ?? 'idle'}` },
          span({ class: 'lamp', 'aria-hidden': 'true' }),
          button(
            {
              type: 'button',
              class: 'jack',
              'aria-label': `${line.name} line`,
              'aria-pressed': () => String(lamps.value[line.name] === 'ringing'),
              onclick: () => toggle(line),
            },
            span({ class: 'disc', 'aria-hidden': 'true' }),
            span({ class: 'name' }, line.name),
          ),
        ),
      ),
    ),
    div({ class: 'strip', 'aria-live': 'polite' }, () =>
      log.value.length > 0 ? log.value.map((line) => p(line)) : p('No call yet.'),
    ),
  );
};
