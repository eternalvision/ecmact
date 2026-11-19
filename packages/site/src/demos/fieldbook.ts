import { createJSONStorage, createStore, each, em, shallow, signal, tags } from 'ecmact';

const { button, div, form, input, p, s, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 10px 18px 14px 46px;
    background:
      linear-gradient(90deg, transparent 34px, #e8a2a2 34px 35px, transparent 35px),
      repeating-linear-gradient(#fbf8ec 0 27px, #b9cfe6 27px 28px);
    color: #3d3d3d;
    font: 19px/28px 'Bradley Hand', 'Segoe Print', 'Marker Felt', 'Comic Sans MS', cursive;
  }
  p {
    margin: 0;
  }
  .heading {
    text-decoration: underline;
    text-decoration-style: wavy;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 10px;
  }
  .name {
    min-width: 4.2em;
  }
  .tally {
    flex: 1;
    min-width: 0;
    letter-spacing: 0.06em;
    overflow-wrap: anywhere;
  }
  s {
    text-decoration-thickness: 2px;
    margin-right: 6px;
  }
  button {
    margin: 0 8px 0 0;
    padding: 0 8px;
    border: 1.5px solid #3d3d3d;
    border-radius: 12px 9px 13px 8px;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
  }
  button:hover {
    background: rgba(61, 61, 61, 0.08);
  }
  button:focus-visible,
  input:focus-visible {
    outline: 3px solid #1f3a5f;
    outline-offset: 2px;
  }
  .tear {
    border-style: dashed;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
  }
  input {
    width: 9em;
    min-width: 0;
    border: 0;
    border-bottom: 1.5px solid #3d3d3d;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 16px;
  }
  .status {
    font-size: 16px;
  }
  .status.lost {
    color: #9b1c1c;
    font-weight: 700;
  }
`;

/** One kind of bird, and how many were seen. */
interface Bird {
  /** The name, which is also the key of its row. */
  name: string;
  /** The number of sightings. */
  count: number;
}

/** The notebook as the first version of the example stored it: counts by lower-case name. */
interface Tally {
  /** The counts. */
  tally: Record<string, number>;
}

const storageKey = 'ecmact-site-fieldbook';

/**
 * Makes the page of a day in the marsh, with the sightings the example starts from.
 *
 * @returns The birds.
 */
const firstPage = (): Bird[] => [
  { name: 'Wren', count: 7 },
  { name: 'Curlew', count: 2 },
  { name: 'Heron', count: 1 },
];

/**
 * Turns a notebook of an older version into the present shape. Version 1 stored counts by lower-case name.
 *
 * @param stored - What was stored.
 * @param version - The version it was stored with.
 * @returns The state to keep.
 */
const migrate = (stored: unknown, version: number) =>
  version === 1
    ? {
        birds: Object.entries((stored as Tally).tally).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
        })),
      }
    : { birds: firstPage() };

/**
 * A bird-watcher's tally that is still there after a reload. The store keeps the birds in `localStorage` with a
 * version, so a notebook of an older version is converted. When the storage is blocked the notebook still works
 * for the visit and says that it will not be kept.
 *
 * @returns The example.
 */
export const create = () => {
  const kept = signal(true);
  const draft = signal('');

  /**
   * Runs a storage call that may throw. A call that throws means the page will not be kept.
   *
   * @param run - The call.
   * @returns What the call returned, or `null`.
   */
  const careful = <T>(run: () => T) => {
    try {
      return run();
    } catch {
      kept.value = false;
      return null;
    }
  };

  const written = signal(careful(() => localStorage.getItem(storageKey)) !== null);

  const store = createStore(
    { birds: firstPage() },
    (set) => ({
      see: (name: string) =>
        set(({ birds }) => ({
          birds: birds.map((bird) =>
            bird.name === name ? { ...bird, count: bird.count + 1 } : bird,
          ),
        })),
      add: (name: string) =>
        set(({ birds }) =>
          birds.some((bird) => bird.name.toLowerCase() === name.toLowerCase())
            ? { birds }
            : { birds: [...birds, { name, count: 1 }] },
        ),
    }),
    {
      persist: {
        name: storageKey,
        version: 2,
        partialize: ({ birds }) => ({ birds }),
        migrate,
        storage: createJSONStorage(() => ({
          getItem: (key) => careful(() => localStorage.getItem(key)),
          setItem: (key, value) => careful(() => localStorage.setItem(key, value)),
          removeItem: (key) => careful(() => localStorage.removeItem(key)),
        })),
      },
    },
  );
  const counts = store.select(({ birds }) => birds.map((bird) => bird.count), shallow);
  const total = () => counts.value.reduce((sum, count) => sum + count, 0);
  store.watch(
    ({ birds }) => birds.map((bird) => `${bird.name}${bird.count}`).join(),
    () => {
      written.value = true;
    },
  );

  /**
   * Draws a count as tally marks: a struck bundle for every five.
   *
   * @param count - The number of sightings.
   * @returns The marks.
   */
  const marks = (count: number) => [
    Array.from({ length: Math.floor(count / 5) }, () => s('||||')),
    '|'.repeat(count % 5),
  ];

  /**
   * Tears the page out: back to the first page, and nothing is left in the storage.
   */
  const tear = () => {
    store.setState({ birds: firstPage() });
    careful(() => store.persist?.clearStorage());
    written.value = false;
  };

  return em.Fieldbook(
    { css },
    p({ class: 'heading' }, 'Saltmarsh, Thursday'),
    each(
      () => store.birds,
      (bird) =>
        div(
          { class: 'row' },
          span({ class: 'name' }, bird.name),
          span(
            { class: 'tally', role: 'img', 'aria-label': `${bird.count} ${bird.name}` },
            marks(bird.count),
          ),
          button(
            {
              type: 'button',
              'aria-label': `One more ${bird.name}`,
              onclick: () => store.see(bird.name),
            },
            '+',
          ),
        ),
      { by: (bird) => bird.name },
    ),
    form(
      {
        onsubmit: (event) => {
          event.preventDefault();
          const name = draft.value.trim();
          if (name === '') return;
          store.add(name.charAt(0).toUpperCase() + name.slice(1));
          draft.value = '';
        },
      },
      input({ bind: draft, placeholder: 'another bird', 'aria-label': 'Another bird' }),
      button({ type: 'submit' }, 'write it down'),
      button({ type: 'button', class: 'tear', onclick: tear }, 'tear out the page'),
    ),
    p({ class: { status: true, lost: () => !kept.value }, role: 'status' }, () =>
      !kept.value
        ? 'Storage is blocked: this page will not be kept after the visit.'
        : written.value
          ? `${total()} seen. Written in pencil: reload the page and it stays.`
          : `${total()} seen so far. Add a sighting, then reload the page.`,
    ),
  );
};
