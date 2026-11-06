import { combine, createStore, em, persist, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
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
 * Notes that survive a reload: `persist` writes the state to `localStorage` after every change and reads it back
 * when the store is created. Add a note, then reload the page.
 *
 * @returns The demo.
 */
export const create = () => {
  const store = createStore(
    persist(
      combine({ notes: ['Reload the page: I will still be here'] as string[] }, (set) => ({
        add: (note: string) => set((state) => ({ notes: [...state.notes, note] })),
        clear: () => set({ notes: [] }),
      })),
      { name: 'ecmact-site-notes', partialize: (state) => ({ notes: state.notes }) },
    ),
  );

  const list = tags.ul({ shadow: false });
  const input = tags.input({
    shadow: false,
    placeholder: 'Write a note',
    'aria-label': 'New note',
  });

  return em.Notes({
    shadow: true,
    css,
    mounted: () =>
      store.watch(
        (state) => state.notes,
        (notes) =>
          list.setState({
            children: notes.map((note) => tags.li({ shadow: false, content: note })),
          }),
        { fireImmediately: true },
      ),
    children: [
      tags.form({
        shadow: false,
        onsubmit: (event) => {
          event.preventDefault();
          const field = input.element as HTMLInputElement;
          if (field.value.trim() === '') return;
          store.getState().add(field.value.trim());
          field.value = '';
        },
        children: [
          input,
          tags.button({ shadow: false, type: 'submit', content: 'Save' }),
          tags.button({
            shadow: false,
            type: 'button',
            content: 'Clear',
            onclick: () => store.getState().clear(),
          }),
        ],
      }),
      list,
      tags.small({
        shadow: false,
        content: store.select((state) => `${state.notes.length} saved in localStorage`),
      }),
    ],
  });
};
