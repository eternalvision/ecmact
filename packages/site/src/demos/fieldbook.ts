import { createJSONStorage, createStore, each, em, shallow, signal, tags } from 'ecmact';

const { button, div, form, input, p, s, span } = tags;

const css = `
  :host {
    position: relative;
    display: block;
    color-scheme: light;
    padding: 38px 22px 20px;
    background: #fff27a;
    color: #1b3bff;
    font-family: 'Bradley Hand', 'Segoe Print', 'Chalkboard SE', 'Comic Sans MS', 'Comic Neue', cursive;
    font-size: 19px;
    font-weight: 700;
    line-height: 1.3;
  }
  :host::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 50%;
    width: 108px;
    height: 24px;
    transform: translateX(-50%) rotate(-2deg);
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 1px 2px rgba(60, 50, 0, 0.18);
  }
  :host::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #e9d84e 50%, #f4f4f4 50%);
    box-shadow: -2px -2px 4px rgba(60, 50, 0, 0.14);
  }
  p {
    margin: 0;
  }
  .heading {
    margin: 0 0 6px;
    font-size: 26px;
    text-decoration: underline wavy #c81e4a 2px;
    text-underline-offset: 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    border-bottom: 2px solid rgba(27, 59, 255, 0.22);
  }
  .name {
    flex: 0 0 4.6em;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .tally {
    flex: 1;
    min-width: 0;
    letter-spacing: 0.16em;
    overflow-wrap: anywhere;
  }
  .tally s {
    margin-right: 0.4em;
    text-decoration-thickness: 2.5px;
  }
  button {
    border: 2.5px solid #1b3bff;
    background: transparent;
    color: #1b3bff;
    font: inherit;
    cursor: pointer;
  }
  .row:nth-of-type(even) button {
    border-radius: 58% 42% 55% 45% / 44% 58% 42% 56%;
    transform: rotate(-4deg);
  }
  .row button {
    width: 34px;
    height: 32px;
    padding: 0;
    border-radius: 46% 54% 42% 58% / 56% 44% 58% 42%;
    font-size: 20px;
    line-height: 1;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 12px;
    margin-top: 16px;
  }
  input {
    flex: 1 1 100%;
    min-width: 0;
    padding: 4px 2px;
    border: 0;
    border-bottom: 2.5px dashed #1b3bff;
    border-radius: 2px;
    background: transparent;
    color: #1b3bff;
    font: inherit;
  }
  input::placeholder {
    color: #1b3bff;
    opacity: 0.75;
  }
  form button {
    padding: 5px 16px;
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    background: #1b3bff;
    color: #fff27a;
    font-size: 17px;
  }
  form .tear {
    border-style: dashed;
    border-color: #a8103a;
    border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px;
    background: transparent;
    color: #a8103a;
  }
  .status {
    margin: 14px 28px 0 0;
    font-size: 16.5px;
  }
  .status.lost {
    color: #a8103a;
    font-weight: 800;
    text-decoration: underline wavy;
    text-underline-offset: 4px;
  }
  :focus-visible {
    outline: 3px solid #1b3bff;
    outline-offset: 3px;
  }
  .tear:focus-visible {
    outline-color: #a8103a;
  }
  @media (prefers-reduced-motion: no-preference) {
    .row {
      animation: write 0.45s ease-out;
    }
    @keyframes write {
      from { clip-path: inset(0 100% 0 0); }
      to { clip-path: inset(0 0 0 0); }
    }
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
