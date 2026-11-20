import { createHttp, em, signal, tags, type HttpError } from 'ecmact';

const { button, div, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 22px 16px 18px;
    background: #ece7ff;
    color: #241b4b;
    font-family: Seravek, 'Gill Sans Nova', 'Gill Sans', Ubuntu, Calibri, 'DejaVu Sans', sans-serif;
  }
  .jacks {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
  .line {
    position: relative;
    padding: 8px 8px 12px;
    border-radius: 999px 999px 22px 22px;
    background: #ffffff;
  }
  .lamp {
    display: block;
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #d9d2f5;
  }
  .jack {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 10px;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 999px 999px 16px 16px;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .disc {
    width: calc(100% - 14px);
    aspect-ratio: 1;
    margin-top: 7px;
    border-radius: 50%;
    background: radial-gradient(circle, #1b1340 0 24%, #5b3df5 26%);
  }
  .name {
    overflow-wrap: anywhere;
  }
  .ringing {
    background: #fff1d6;
  }
  .ringing .lamp {
    background: #ffb020;
    box-shadow: 0 0 18px 4px rgba(255, 176, 32, 0.75);
  }
  .ringing .disc {
    background: radial-gradient(circle, #ffb020 0 24%, #1b1340 26% 40%, #5b3df5 42%);
  }
  .ok {
    background: #e3fbef;
  }
  .ok .lamp {
    background: #19c37d;
    box-shadow: 0 0 16px 3px rgba(25, 195, 125, 0.6);
  }
  .bad {
    background: #ffe4e4;
  }
  .bad .lamp {
    background: #ff4d4f;
    box-shadow: 0 0 16px 3px rgba(255, 77, 79, 0.6);
  }
  .cut {
    background: #f1eff7;
  }
  .cut .lamp {
    background: #bdb6d9;
  }
  .cut .disc {
    background: radial-gradient(circle, #1b1340 0 24%, #8d84b8 26%);
  }
  .strip {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 20px 20px 20px 4px;
    background: #ffffff;
    font-size: 15.5px;
    line-height: 1.4;
    min-height: 3.4em;
    overflow-wrap: anywhere;
  }
  .strip p {
    margin: 0 0 4px;
  }
  :focus-visible {
    outline: 3px solid #241b4b;
    outline-offset: 3px;
  }
  @media (max-width: 480px) {
    :host {
      padding: 20px 12px 16px;
    }
    .jacks {
      gap: 6px;
    }
    .line {
      padding: 6px 4px 10px;
    }
    .lamp {
      top: 6px;
      left: 4px;
      right: 4px;
    }
    .jack {
      font-size: 13px;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .ringing .lamp {
      animation: ring 1.4s ease-out infinite;
    }
    @keyframes ring {
      from {
        box-shadow: 0 0 0 0 rgba(255, 176, 32, 0.9);
      }
      to {
        box-shadow: 0 0 0 14px rgba(255, 176, 32, 0);
      }
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
