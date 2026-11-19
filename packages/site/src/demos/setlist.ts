import { computed, createStore, each, em, signal, tags } from 'ecmact';

const { button, div, form, input, li, ol, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 18px;
    background:
      radial-gradient(rgba(255, 255, 255, 0.05) 0.7px, transparent 1px) 0 0 / 5px 5px,
      #131313;
    color: #171717;
    font-family: 'Marker Felt', 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;
  }
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: song;
  }
  li {
    counter-increment: song;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 8px;
    margin: 0 0 9px;
    padding: 7px 12px;
    background: #f1efe6;
    clip-path: polygon(0 6%, 2% 0, 98% 3%, 100% 0, 99% 94%, 100% 100%, 3% 97%, 0 100%);
    font-size: 19px;
  }
  li:nth-child(even) {
    background: #ecd94a;
  }
  li::before {
    content: counter(song) '.';
  }
  li.empty {
    counter-increment: none;
    justify-content: center;
    padding: 14px 12px;
    transform: rotate(-0.8deg);
  }
  li.empty::before {
    content: none;
  }
  .title {
    flex: 1 1 8ch;
    min-width: 8ch;
    overflow-wrap: break-word;
  }
  .controls {
    display: flex;
    margin-left: auto;
  }
  .played .title {
    text-decoration: line-through;
    text-decoration-thickness: 3px;
    opacity: 0.55;
  }
  button {
    min-width: 30px;
    min-height: 30px;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 17px;
    cursor: pointer;
  }
  li button:hover {
    background: rgba(0, 0, 0, 0.12);
  }
  button:focus-visible,
  input:focus-visible {
    outline: 3px solid #ffd54a;
    outline-offset: 2px;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0 0;
  }
  input {
    min-width: 0;
    padding: 6px 8px;
    border: 0;
    border-bottom: 3px solid #f1efe6;
    background: #232323;
    color: #f1efe6;
    font: inherit;
  }
  input[name='title'] {
    flex: 1 1 9rem;
  }
  input[name='minutes'] {
    width: 4.5rem;
  }
  form button,
  .curfew button {
    padding: 4px 12px;
    background: #f1efe6;
    color: #171717;
  }
  .sum {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    margin: 14px 0 0;
    color: #f1efe6;
    font-size: 15px;
    letter-spacing: 0.04em;
  }
  .sum.over .total {
    color: #ff7a6b;
  }
  .curfew {
    display: inline-flex;
    gap: 4px;
  }
  .curfew button {
    min-width: 0;
    padding: 0 10px;
    font-size: 15px;
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
