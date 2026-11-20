import { each, em, resource, signal, tags } from 'ecmact';

const { button, div, p, small, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 18px;
    background: #ff8a1f;
    color: #111111;
    font-family: 'DIN Alternate', Bahnschrift, 'DIN Condensed', 'Franklin Gothic Medium', 'Roboto Condensed', 'Arial Narrow', sans-serif;
  }
  button {
    border: 0;
    border-radius: 999px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  .tabs {
    display: flex;
    gap: 2px;
    padding: 6px;
    border-radius: 999px;
    background: #111111;
  }
  .tabs button {
    flex: 1;
    min-width: 0;
    min-height: 40px;
    padding: 0 4px;
    background: transparent;
    color: #ffffff;
    font-size: 15.5px;
  }
  .tabs button[aria-pressed='true'] {
    background: #ff8a1f;
    color: #111111;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0 14px;
  }
  .controls button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 14px;
    background: #ffffff;
    color: #111111;
    font-size: 15px;
  }
  .controls button[aria-pressed]::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 2.5px #111111;
  }
  .controls button[aria-pressed='true'] {
    background: #111111;
    color: #ffffff;
  }
  .controls button[aria-pressed='true']::before {
    background: #ff8a1f;
    box-shadow: none;
  }
  .controls button:not([aria-pressed]) {
    margin-left: auto;
    background: #111111;
    color: #ff8a1f;
  }
  .rows {
    display: grid;
    align-content: start;
    gap: 8px;
    min-height: 122px;
  }
  .rows[aria-busy='true'] {
    border-radius: 999px;
    background: linear-gradient(100deg, rgba(255, 255, 255, 0.4) 35%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 255, 255, 0.4) 65%);
    background-size: 220% 100%;
  }
  .loading,
  .error {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    line-height: 1.2;
  }
  .loading {
    padding: 18px 22px;
  }
  .error {
    padding: 14px 20px;
    border-radius: 28px;
    background: #ffffff;
    color: #b00020;
  }
  .error button {
    display: block;
    min-height: 36px;
    margin-top: 10px;
    padding: 0 18px;
    background: #111111;
    color: #ff8a1f;
    font-size: 15px;
  }
  .sailing {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 14px;
    min-height: 56px;
    padding: 8px 8px 8px 20px;
    border-radius: 999px;
    background: #ffffff;
  }
  .sailing > span:first-child {
    font-size: 27px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .sailing > span:nth-child(2) {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }
  .sailing small {
    display: block;
    font-size: 13px;
    color: #b00020;
  }
  .sailing > span:last-child {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #111111;
    color: #ff8a1f;
    font-size: 17px;
    font-weight: 700;
  }
  .sailing.off > span:first-child {
    text-decoration: line-through;
    text-decoration-thickness: 3px;
  }
  .foot {
    margin: 14px 0 0;
    font-size: 14.5px;
    font-weight: 700;
  }
  :focus-visible {
    outline: 3px solid #111111;
    outline-offset: 3px;
  }
  .tabs button:focus-visible {
    outline-color: #ffffff;
    outline-offset: 0;
  }
  @media (prefers-reduced-motion: no-preference) {
    .rows[aria-busy='true'] {
      animation: shimmer 1.2s linear infinite;
    }
    @keyframes shimmer {
      from {
        background-position: 100% 0;
      }
      to {
        background-position: -120% 0;
      }
    }
  }
`;

/** A sailing on the board. */
interface Sailing {
  /** The time of departure. */
  at: string;
  /** Where it goes. */
  to: string;
  /** The pier it leaves from. */
  pier: string;
  /** Why it will not leave, when it will not. */
  off?: string;
}

const harbours = [
  { id: 'north', name: 'North Pier' },
  { id: 'salt', name: 'Saltmarsh' },
  { id: 'light', name: 'Lighthouse' },
];

const timetable: Record<string, Sailing[]> = {
  north: [
    { at: '07:10', to: 'Saltmarsh', pier: 'A' },
    { at: '07:45', to: 'Lighthouse', pier: 'B' },
    { at: '08:20', to: 'Saltmarsh', pier: 'A' },
  ],
  salt: [
    { at: '07:30', to: 'North Pier', pier: 'C' },
    { at: '09:00', to: 'North Pier', pier: 'C' },
  ],
  light: [
    { at: '08:05', to: 'North Pier', pier: 'D', off: 'cancelled, fog' },
    { at: '10:40', to: 'North Pier', pier: 'D' },
  ],
};

/**
 * A ferry departures board. The harbour is a signal and the board is a resource that reads it, so choosing
 * another harbour aborts the request in flight and the board never shows an answer that was meant for a harbour
 * that is no longer chosen. The timetable is a function in the example, with a sea that can be rough, which
 * makes it slow, and a fog that makes it fail; the fetcher counts the requests that were aborted while they waited.
 *
 * @returns The example.
 */
export const create = () => {
  const harbour = signal('north');
  const rough = signal(false);
  const fog = signal(false);
  const aborted = signal(0);
  let rows: HTMLElement;

  const board = resource<Sailing[]>(
    ({ signal: stop }) => {
      const name = harbour.value;
      const wait = rough.peek() ? 1500 : 300;
      const foggy = fog.peek();
      return new Promise<Sailing[]>((resolve, reject) => {
        const timer = setTimeout(() => {
          stop.removeEventListener('abort', cancel);
          if (foggy) reject(new Error('Fog: the harbour office is not answering.'));
          else resolve(timetable[name] as Sailing[]);
        }, wait);
        const cancel = () => {
          clearTimeout(timer);
          aborted.value = aborted.peek() + 1;
          reject(new DOMException('A newer request replaced this one', 'AbortError'));
        };
        stop.addEventListener('abort', cancel, { once: true });
      });
    },
    { initial: [] },
  );

  /**
   * Makes a button that switches a condition of the sea on and off.
   *
   * @param label - The text of the button.
   * @param on - The signal it switches.
   * @returns The button.
   */
  const switchButton = (label: string, on: typeof rough) =>
    button(
      {
        type: 'button',
        'aria-pressed': () => String(on.value),
        onclick: () => {
          on.value = !on.value;
        },
      },
      label,
    );

  return em.Departures(
    { css },
    div(
      { class: 'tabs' },
      harbours.map(({ id, name }) =>
        button(
          {
            type: 'button',
            'aria-pressed': () => String(harbour.value === id),
            onclick: () => {
              harbour.value = id;
            },
          },
          name,
        ),
      ),
    ),
    div(
      { class: 'controls' },
      switchButton('Rough sea', rough),
      switchButton('Fog', fog),
      button({ type: 'button', onclick: () => board.refetch() }, 'Ask again'),
    ),
    div(
      {
        class: 'rows',
        tabindex: -1,
        'aria-label': 'Departures',
        'aria-busy': () => String(board.loading),
        ref: (element) => {
          rows = element as HTMLElement;
        },
      },
      () => board.loading && p({ class: 'loading' }, 'Loading the board...'),
      () =>
        !board.loading &&
        board.error !== undefined &&
        div(
          { class: 'error', role: 'alert' },
          (board.error as Error).message,
          button(
            {
              type: 'button',
              onclick: () => {
                board.refetch();
                rows.focus();
              },
            },
            'Retry',
          ),
        ),
      each(
        () => (board.loading || board.error !== undefined ? [] : (board.data as Sailing[])),
        (sailing) =>
          div(
            { class: { sailing: true, off: sailing.off !== undefined } },
            span(sailing.at),
            span(sailing.to, sailing.off !== undefined && small(sailing.off)),
            span(sailing.pier),
          ),
        { by: (sailing) => sailing.at },
      ),
    ),
    p({ class: 'foot' }, () => `requests aborted: ${aborted.value}`),
  );
};
