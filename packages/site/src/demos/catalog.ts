import {
  computed,
  createHttp,
  each,
  effect,
  em,
  signal,
  tags,
  type HttpError,
  type Signal,
} from 'ecmact';

const { b, button, div, input, p, small, span } = tags;

const css = `
  :host {
    display: grid;
    gap: 14px;
    color-scheme: light;
    padding: 18px;
    background: #ffffff;
    color: #18181b;
    font-family: Optima, Candara, 'Noto Sans', 'Segoe UI', sans-serif;
  }
  .find {
    box-sizing: border-box;
    width: 100%;
    padding: 13px 20px;
    border: 0;
    border-radius: 999px;
    background: #f1f1f4;
    box-shadow: 0 0 0 3px #18181b;
    color: inherit;
    font: inherit;
    font-size: 17px;
  }
  .find::placeholder {
    color: #52525b;
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    align-content: start;
    gap: 22px 12px;
    max-height: 340px;
    padding: 18px 6px 6px;
    overflow-y: auto;
  }
  .card {
    --spine: #ff5a36;
    --tint: #ffede8;
    position: relative;
    display: grid;
    align-content: start;
    gap: 4px;
    padding: 14px 12px 12px 14px;
    border-left: 10px solid var(--spine);
    border-radius: 4px 20px 20px 4px;
    background: var(--tint);
  }
  .card:nth-of-type(4n + 2) {
    --spine: #2f5bff;
    --tint: #e9eeff;
  }
  .card:nth-of-type(4n + 3) {
    --spine: #0fa968;
    --tint: #e3f7ee;
  }
  .card:nth-of-type(4n + 4) {
    --spine: #ffb800;
    --tint: #fff5d6;
  }
  .card b {
    font-size: 17.5px;
    line-height: 1.15;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .card small {
    font-size: 13.5px;
    color: #52525b;
  }
  .card button {
    justify-self: start;
    min-height: 34px;
    margin-top: 8px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: #18181b;
    color: #ffffff;
    font: inherit;
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .due {
    position: absolute;
    top: -13px;
    right: 10px;
    padding: 2px 10px;
    border-radius: 999px;
    background: #18181b;
    color: #ffffff;
    font-size: 12.5px;
    font-weight: 700;
    text-transform: lowercase;
    transform: rotate(4deg);
  }
  .due[hidden] {
    display: none;
  }
  .none {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 15px;
  }
  .notice {
    margin: 0;
    padding: 10px 14px;
    border-radius: 16px;
    background: #ffede8;
    color: #8a1c14;
    font-size: 15px;
  }
  .notice:empty {
    display: none;
  }
  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0;
    font-size: 14.5px;
  }
  .desk {
    padding: 7px 14px;
    border-radius: 999px;
    background: #f1f1f4;
  }
  .desk.wait {
    background: #ffedb3;
    font-weight: 700;
  }
  .open {
    min-height: 34px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: #f1f1f4;
    color: #18181b;
    font: inherit;
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
  }
  :focus-visible {
    outline: 3px solid #18181b;
    outline-offset: 3px;
  }
  .find:focus-visible {
    outline-color: #2f5bff;
    outline-offset: 6px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .find {
      transition: box-shadow 0.18s;
    }
    .find:focus-visible {
      box-shadow: 0 0 0 6px #18181b;
    }
  }
`;

/** A card of the drawer. */
interface Book {
  /** The number of the card. */
  id: number;
  /** The title. */
  title: string;
  /** The shelf mark. */
  shelf: string;
  /** The year of the edition. */
  year: number;
}

const shelf: Book[] = [
  { id: 1, title: 'Marsh Birds of the North Shore', shelf: '598.2', year: 1961 },
  { id: 2, title: 'A Short History of Knots', shelf: '623.8', year: 1974 },
  { id: 3, title: 'Tides and the People Who Read Them', shelf: '551.4', year: 1958 },
  { id: 4, title: "The Lighthouse Keeper's Cookbook", shelf: '641.5', year: 1983 },
  { id: 5, title: 'Salt, Slowly', shelf: '553.6', year: 1969 },
  { id: 6, title: 'Pressed Seaweed: A Field Guide', shelf: '579.8', year: 1977 },
];

/** How many desk requests a window allows. */
const limit = 5;

/** How long a window of requests lasts, in milliseconds. */
const period = 10000;

/**
 * Makes the library: a function with the shape of `fetch` that serves the drawer and the desk. It is passed to
 * `createHttp`, so the example needs no network. The drawer answers short searches slowly, so a newer search
 * is usually the faster one. The desk allows five requests in ten seconds, answers the sixth with 429 and a
 * `Retry-After`, and answers 503 while it is closed.
 *
 * @param open - Whether the desk is open.
 * @returns The `fetch` of the library.
 */
const makeLibrary = (open: Signal<boolean>): typeof fetch => {
  let hits: number[] = [];

  /**
   * Makes a JSON answer.
   *
   * @param status - The status.
   * @param headers - Extra headers.
   * @returns The response.
   */
  const json = (status: number, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify({ status }), {
      status,
      headers: { 'content-type': 'application/json', ...headers },
    });

  /**
   * Counts a request against the window and answers it.
   *
   * @returns The response of the desk.
   */
  const desk = () => {
    const now = Date.now();
    hits = hits.filter((at) => now - at < period);
    const allowed = hits.length < limit;
    if (allowed) hits.push(now);
    const reset = Math.ceil(((hits[0] as number) + period - now) / 1000);
    const rate = { 'x-ratelimit-used': String(hits.length), 'x-ratelimit-reset': String(reset) };
    if (!allowed) return json(429, { ...rate, 'retry-after': String(reset) });
    return json(open.value ? 200 : 503, rate);
  };

  return (input, init) =>
    new Promise<Response>((resolve, reject) => {
      const [path, ...rest] = String(input).split('?');
      const asked = new URLSearchParams(rest.join('?')).getAll('q').join('');
      const drawer = path === '/books';
      const wait = drawer ? (asked === '' ? 100 : 700 - 150 * Math.min(asked.length, 4)) : 250;
      const timer = setTimeout(
        () =>
          resolve(
            drawer
              ? new Response(
                  JSON.stringify(shelf.filter((book) => book.title.toLowerCase().includes(asked))),
                  { headers: { 'content-type': 'application/json' } },
                )
              : desk(),
          ),
        wait,
      );
      ((init as RequestInit).signal as AbortSignal).addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('The search was replaced', 'AbortError'));
      });
    });
};

/**
 * A library card catalogue. The search aborts the older request when a newer one starts, and ignores an answer
 * that was already on its way. Borrowing is optimistic: the card is stamped at once and the stamp is taken back
 * when the desk refuses, with the reason. A request interceptor tidies the query, and response interceptors read
 * the rate limit of the desk, which answers the sixth request of a window with 429 and a wait that the page counts down.
 *
 * @returns The example.
 */
export const create = () => {
  const open = signal(true);
  const query = signal('');
  const found = signal<{ q: string; books: Book[] }>({ q: '', books: [] });
  const searching = signal(true);
  const loans = signal<ReadonlySet<number>>(new Set());
  const notice = signal('');
  const used = signal(0);
  const resetAt = signal(0);
  const waitUntil = signal(0);
  const now = signal(Date.now());

  const api = createHttp({ fetch: makeLibrary(open) });

  /**
   * Reads the rate limit that the desk wrote on an answer.
   *
   * @param headers - The headers of the answer.
   */
  const read = (headers: Record<string, string>) => {
    if (headers['x-ratelimit-used'] === undefined) return;
    now.value = Date.now();
    used.value = Number(headers['x-ratelimit-used']);
    resetAt.value = now.value + Number(headers['x-ratelimit-reset']) * 1000;
    if (headers['retry-after'] !== undefined) {
      waitUntil.value = now.value + Number(headers['retry-after']) * 1000;
    }
  };

  api.interceptors.request.use(
    (config) => ({
      ...config,
      params: {
        q: String((config.params as { q: string }).q)
          .trim()
          .toLowerCase(),
      },
    }),
    undefined,
    { runWhen: (config) => config.method === 'get' },
  );
  api.interceptors.response.use(
    (response) => {
      read(response.headers);
      return response;
    },
    (error) => {
      const { response } = error as HttpError;
      if (response) read(response.headers);
      return Promise.reject(error);
    },
  );

  const inWindow = computed(() => (now.value >= resetAt.value ? 0 : used.value));
  const waiting = computed(() => Math.max(0, Math.ceil((waitUntil.value - now.value) / 1000)));

  /**
   * Puts a card on loan or takes it off, in the page only.
   *
   * @param id - The number of the card.
   * @param on - Whether the book is on loan.
   */
  const setLoan = (id: number, on: boolean) => {
    const next = new Set(loans.value);
    if (on) next.add(id);
    else next.delete(id);
    loans.value = next;
  };

  /**
   * Borrows a book, or returns it. The page changes first and the desk is asked after; a refusal undoes it.
   *
   * @param book - The book.
   */
  const toggle = (book: Book) => {
    const had = loans.value.has(book.id);
    notice.value = '';
    setLoan(book.id, !had);
    (had ? api.delete(`/loans/${book.id}`) : api.post('/loans', { id: book.id })).catch(
      (error: HttpError) => {
        setLoan(book.id, had);
        notice.value = `The desk is ${error.status === 503 ? 'closed' : 'busy'}, so "${book.title}" was not ${had ? 'returned' : 'borrowed'}. The loan is rolled back.`;
      },
    );
  };

  return em.Catalog(
    {
      css,
      mounted: () => {
        const clock = setInterval(() => {
          now.value = Date.now();
        }, 1000);
        const stop = effect(() => {
          const asked = query.value;
          const controller = new AbortController();
          searching.value = true;
          api.get<Book[]>('/books', { params: { q: asked }, signal: controller.signal }).then(
            (response) => {
              if (controller.signal.aborted) return;
              found.value = { q: asked.trim(), books: response.data };
              searching.value = false;
            },
            () => undefined,
          );
          return () => controller.abort();
        });
        return () => {
          clearInterval(clock);
          stop();
        };
      },
    },
    input({
      class: 'find',
      bind: query,
      placeholder: 'search the drawer',
      'aria-label': 'Search the catalogue',
    }),
    div(
      { class: 'list', role: 'region', tabindex: 0, 'aria-label': 'Cards' },
      each(
        () => found.value.books,
        (book) =>
          div(
            { class: 'card' },
            b(book.title),
            small(`Shelf ${book.shelf} · ${book.year}`),
            button(
              {
                type: 'button',
                'aria-label': () =>
                  `${loans.value.has(book.id) ? 'Return' : 'Borrow'} ${book.title}`,
                onclick: () => toggle(book),
              },
              () => (loans.value.has(book.id) ? 'Return' : 'Borrow'),
            ),
            span({ class: 'due', hidden: () => !loans.value.has(book.id) }, 'ON LOAN'),
          ),
        {
          by: (book) => book.id,
          empty: p({ class: 'none' }, () =>
            searching.value ? 'Looking in the drawer...' : `No card matches "${found.value.q}".`,
          ),
        },
      ),
    ),
    p({ class: 'notice', role: 'status' }, notice),
    div(
      { class: 'foot' },
      span({ class: { desk: true, wait: () => waiting.value > 0 }, 'aria-live': 'polite' }, () =>
        waiting.value > 0
          ? `desk: too many requests, wait ${waiting.value} s`
          : `desk: ${inWindow.value} of ${limit} requests in this window`,
      ),
      button(
        {
          type: 'button',
          class: 'open',
          onclick: () => {
            open.value = !open.value;
          },
        },
        () => (open.value ? 'Close the desk' : 'Open the desk'),
      ),
    ),
  );
};
