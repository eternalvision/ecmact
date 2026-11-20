import { computed, createStore, each, em, signal, tags } from 'ecmact';

const { button, div, form, input, li, ol, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 18px;
    background: #ff5ca8;
    color: #111111;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  ol {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: song;
  }
  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    padding: 7px 8px 7px 10px;
    border: 3px solid #111111;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 4px 4px 0 #111111;
    font-size: 16px;
    font-weight: 800;
  }
  li:hover,
  li:focus-within {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0 #111111;
  }
  li::before {
    counter-increment: song;
    content: counter(song);
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #111111;
    color: #ffffff;
    font-size: 13px;
  }
  li.empty {
    justify-content: center;
    padding: 14px 12px;
    text-align: center;
  }
  li.empty::before {
    display: none;
  }
  .title {
    flex: 1 1 96px;
    min-width: 0;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  li > span:nth-child(2) {
    padding: 1px 8px;
    border: 2px solid #111111;
    border-radius: 999px;
    background: #c6ff3d;
    font-size: 13px;
  }
  .controls {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  button {
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    border: 2px solid #111111;
    border-radius: 50%;
    background: #ffe14a;
    color: #111111;
    font: inherit;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
  }
  .controls button[aria-pressed='true'] {
    background: #111111;
    color: #c6ff3d;
  }
  li.played {
    background: #ffe1ef;
    box-shadow: 2px 2px 0 #111111;
  }
  .played .title {
    text-decoration: line-through;
    text-decoration-thickness: 3px;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0 0;
  }
  input {
    min-width: 0;
    padding: 8px 10px;
    border: 3px solid #111111;
    border-radius: 12px;
    background: #ffffff;
    color: #111111;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
  }
  input::placeholder {
    color: #595959;
    opacity: 1;
  }
  input[name='title'] {
    flex: 1 1 9rem;
  }
  input[name='minutes'] {
    width: 58px;
  }
  form button {
    padding: 8px 16px;
    border-radius: 12px;
    background: #c6ff3d;
    box-shadow: 3px 3px 0 #111111;
    font-weight: 900;
  }
  .sum {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px 10px;
    margin: 14px 0 0;
    padding: 7px 8px 7px 16px;
    border-radius: 26px;
    background: #111111;
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
  }
  .sum.over .total {
    color: #ff9fa0;
  }
  .curfew {
    display: flex;
    gap: 4px;
  }
  .curfew button {
    min-width: 40px;
    padding: 0 8px;
    border-color: #ffffff;
    border-radius: 999px;
    font-size: 13px;
  }
  :focus-visible {
    outline: 3px solid #111111;
    outline-offset: 3px;
  }
  .sum :focus-visible {
    outline-color: #ffffff;
  }
  @media (prefers-reduced-motion: no-preference) {
    li {
      transition: transform 0.12s, box-shadow 0.12s;
    }
  }
`;

/** One song of the running order. */
interface Song {
  /** The key of the row. */
  id: number;
  /** The title. */
  title: string;
  /** The length, in minutes. */
  minutes: number;
  /** Whether it has been played. */
  played: boolean;
}

/**
 * A band's running order. A store holds the songs and the curfew, `each` shows the songs as a keyed list, and a row
 * that moves is the same node, with its focus. Only the total is computed again.
 *
 * @returns The example.
 */
export const create = () => {
  let next = 5;
  const store = createStore(
    {
      songs: [
        { id: 1, title: 'Opening drone', minutes: 4, played: false },
        { id: 2, title: 'Harbour lights', minutes: 6, played: false },
        { id: 3, title: 'The long one', minutes: 11, played: false },
        { id: 4, title: 'Encore, maybe', minutes: 5, played: false },
      ] as Song[],
      curfew: 45,
    },
    (set) => ({
      add: (title: string, minutes: number) =>
        set(({ songs }) => ({ songs: [...songs, { id: next++, title, minutes, played: false }] })),
      move: (id: number, offset: number) =>
        set((state) => {
          const from = state.songs.findIndex((song) => song.id === id);
          const to = from + offset;
          if (from < 0 || to < 0 || to >= state.songs.length) return state;
          const songs = [...state.songs];
          [songs[from], songs[to]] = [songs[to] as Song, songs[from] as Song];
          return { songs };
        }),
      toggle: (id: number) =>
        set(({ songs }) => ({
          songs: songs.map((song) => (song.id === id ? { ...song, played: !song.played } : song)),
        })),
      remove: (id: number) => set(({ songs }) => ({ songs: songs.filter((s) => s.id !== id) })),
      stretch: (minutes: number) =>
        set(({ curfew }) => ({ curfew: Math.max(5, curfew + minutes) })),
    }),
  );
  const title = signal('');
  const minutes = signal(4);
  const total = computed(() => store.songs.reduce((sum, song) => sum + song.minutes, 0));

  /**
   * Makes a small button of a row.
   *
   * @param name - What it does, for assistive technology.
   * @param symbol - The symbol on the button.
   * @param action - What it does, given the click.
   * @param pressed - Whether it is switched on, for a button that toggles.
   * @returns The button.
   */
  const control = (
    name: string,
    symbol: string,
    action: (event: Event) => void,
    pressed?: boolean,
  ) =>
    button(
      {
        type: 'button',
        'aria-label': name,
        'aria-pressed': pressed === undefined ? undefined : String(pressed),
        onclick: action,
      },
      symbol,
    );

  /**
   * Removes a song and moves the focus to the same control of the next row, the previous one when it was the last,
   * or the title field when no row is left, so that the keyboard does not lose its place.
   *
   * @param event - The click on the remove button of the row.
   * @param id - The song.
   */
  const dismiss = (event: Event, id: number) => {
    const row = (event.currentTarget as HTMLElement).closest('li') as HTMLElement;
    const near = row.nextElementSibling ?? row.previousElementSibling;
    const root = row.getRootNode() as ShadowRoot;
    store.remove(id);
    const target =
      near?.querySelector<HTMLElement>('[aria-label^="Remove"]') ??
      root.querySelector<HTMLElement>('input[name="title"]');
    target?.focus();
  };

  return em.Setlist(
    { css },
    ol(
      each(
        () => store.songs,
        (song) =>
          li(
            { class: { played: song.played } },
            span({ class: 'title' }, song.title),
            span(`${song.minutes}'`),
            span(
              { class: 'controls' },
              control(`Move ${song.title} up`, '↑', () => store.move(song.id, -1)),
              control(`Move ${song.title} down`, '↓', () => store.move(song.id, 1)),
              control(`Played ${song.title}`, '✓', () => store.toggle(song.id), song.played),
              control(`Remove ${song.title}`, '×', (event) => dismiss(event, song.id)),
            ),
          ),
        {
          by: (song) => song.id,
          empty: li({ class: 'empty' }, 'The set list is empty. Add a song.'),
        },
      ),
    ),
    form(
      {
        onsubmit: (event) => {
          event.preventDefault();
          const name = title.value.trim();
          if (name === '' || !(minutes.value >= 1)) return;
          store.add(name, Math.round(minutes.value));
          title.value = '';
        },
      },
      input({ name: 'title', bind: title, placeholder: 'Song title', 'aria-label': 'Song title' }),
      input({
        name: 'minutes',
        type: 'number',
        min: 1,
        max: 30,
        bind: minutes,
        'aria-label': 'Minutes',
      }),
      button({ type: 'submit' }, 'Add'),
    ),
    div(
      { class: { sum: true, over: () => total.value > store.curfew } },
      p(
        { class: 'total', style: { margin: 0 } },
        () =>
          `SET ${total.value}' · CURFEW ${store.curfew}'` +
          (total.value > store.curfew ? ` · OVER BY ${total.value - store.curfew}'` : ''),
      ),
      span(
        { class: 'curfew' },
        control('Curfew 5 minutes earlier', '-5', () => store.stretch(-5)),
        control('Curfew 5 minutes later', '+5', () => store.stretch(5)),
      ),
    ),
  );
};
