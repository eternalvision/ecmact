import { createStore, each, em, signal, tags } from 'ecmact';

const { button, form, input, li, small, span, ul } = tags;

const css = `
  :host { display: block; }
  form { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  form input {
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
  ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.4rem; }
  li { display: flex; align-items: center; gap: 0.6rem; }
  li span { flex: 1; min-width: 0; }
  .done { color: var(--muted); text-decoration: line-through; }
  small { display: block; margin-top: 0.75rem; color: var(--muted); }
`;

/** One thing to do. */
interface Todo {
  /** The key of the item in the list. */
  id: number;
  /** What to do. */
  text: string;
  /** Whether it is done. */
  done: boolean;
}

/**
 * A to-do list: a store holds the items and the actions that change them, `each` shows them as a keyed list, and
 * the counter reads the store in a function, so it follows it.
 *
 * @returns The demo.
 */
export const create = () => {
  let next = 3;
  const store = createStore(
    {
      todos: [
        { id: 1, text: 'Read the docs', done: true },
        { id: 2, text: 'Build a widget', done: false },
      ] as Todo[],
    },
    (set) => ({
      add: (text: string) =>
        set(({ todos }) => ({ todos: [...todos, { id: next++, text, done: false }] })),
      toggle: (id: number) =>
        set(({ todos }) => ({
          todos: todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
        })),
      remove: (id: number) =>
        set(({ todos }) => ({ todos: todos.filter((todo) => todo.id !== id) })),
    }),
  );
  const draft = signal('');

  return em.Todo(
    { css },
    form(
      {
        onsubmit: (event) => {
          event.preventDefault();
          const text = draft.value.trim();
          if (text === '') return;
          store.add(text);
          draft.value = '';
        },
      },
      input({ bind: draft, placeholder: 'What needs doing?', 'aria-label': 'New to-do' }),
      button({ type: 'submit' }, 'Add'),
    ),
    ul(
      each(
        () => store.todos,
        (todo) =>
          li(
            input({
              type: 'checkbox',
              checked: todo.done,
              'aria-label': todo.text,
              onchange: () => store.toggle(todo.id),
            }),
            span({ class: { done: todo.done } }, todo.text),
            button({ onclick: () => store.remove(todo.id) }, 'Remove'),
          ),
        { by: (todo) => todo.id },
      ),
    ),
    small(() => `${store.todos.filter((todo) => !todo.done).length} left of ${store.todos.length}`),
  );
};
