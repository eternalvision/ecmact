import { each, em, resource, signal, tags } from 'ecmact';

const { button, div, p, small, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 18px;
    background: #101010;
    color: #ffd400;
    font-family: 'DIN Condensed', 'Arial Narrow', 'Roboto Condensed', Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .tabs,
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .controls {
    margin-top: 10px;
  }
  button {
    padding: 4px 12px;
    border: 2px solid #ffd400;
    border-radius: 0;
    background: none;
    color: #ffd400;
    font: inherit;
    font-size: 15px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button[aria-pressed='true'] {
    background: #ffd400;
    color: #101010;
  }
  button:focus-visible,
  .rows:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 2px;
  }
  .controls button {
    border-color: #8a7500;
    font-size: 13px;
  }
  .controls button[aria-pressed='true'] {
    border-color: #ffd400;
  }
  .rows {
    margin-top: 10px;
    min-height: 122px;
  }
  .sailing {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) 30px;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 2px solid #2b2b2b;
    font-size: 21px;
    line-height: 1.1;
  }
  .off {
    color: #fff;
  }
  .sailing small {
    display: block;
    font-size: 12px;
  }
  .loading,
  .error {
    margin: 8px 0 0;
    font-size: 21px;
    line-height: 1.2;
  }
  .error {
    color: #fff;
  }
  .error button {
    display: block;
    margin-top: 10px;
  }
  .foot {
    margin: 10px 0 0;
    color: #bdbdbd;
    font: 12px/1.4 ui-monospace, Menlo, monospace;
    letter-spacing: 0;
    text-transform: none;
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
