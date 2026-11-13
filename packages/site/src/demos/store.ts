import { createStore, each, em, signal, tags } from 'ecmact';

const { button, form, input, li, small, ul } = tags;

const css = `
  :host { display: block; }
  form { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  input {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }
  button {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }
  button:hover { border-color: var(--primary); }
  ul { margin: 0; padding-left: 1.2rem; display: grid; gap: 0.25rem; }
  small { display: block; margin-top: 0.75rem; color: var(--muted); }
`;

/**
 * Notes that survive a reload: with the `persist` option the store writes its state to `localStorage` after every
 * change and reads it back when it is created. Add a note, then reload the page.
 *
 * @returns The demo.
 */
export const create = () => {
  const store = createStore(
    { notes: ['Reload the page: I will still be here'] },
    (set) => ({
      add: (note: string) => set(({ notes }) => ({ notes: [...notes, note] })),
      clear: () => set({ notes: [] }),
    }),
    { persist: { name: 'ecmact-site-notes' } },
  );
  const draft = signal('');

  return em.Notes(
    { css },
    form(
      {
        onsubmit: (event) => {
          event.preventDefault();
          const note = draft.value.trim();
          if (note === '') return;
          store.add(note);
          draft.value = '';
        },
      },
      input({ bind: draft, placeholder: 'Write a note', 'aria-label': 'New note' }),
      button({ type: 'submit' }, 'Save'),
      button({ type: 'button', onclick: store.clear }, 'Clear'),
    ),
    ul(
      each(
        () => store.notes,
        (note) => li(note),
        { by: (_note, index) => index },
      ),
    ),
    small(() => `${store.notes.length} saved in localStorage`),
  );
};
