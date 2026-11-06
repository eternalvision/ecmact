import { createStore, em, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
  form { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  form > em-input { flex: 1; min-width: 0; }
  input {
    box-sizing: border-box;
    width: 100%;
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
  li > em-span { display: block; flex: 1; min-width: 0; }
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

/** The state of the store: the items and the actions that change them. */
interface TodoState {
  /** The items. */
  todos: Todo[];
  /**
   * Adds an item at the end.
   *
   * @param text - What to do.
   */
  add: (text: string) => void;
  /**
   * Marks an item done, or not done.
   *
   * @param id - The id of the item.
   */
  toggle: (id: number) => void;
  /**
   * Removes an item.
   *
   * @param id - The id of the item.
   */
  remove: (id: number) => void;
}

/**
 * A to-do list: a store holds the data, a keyed list shows it, and a signal selected from the store drives the counter.
 *
 * @returns The demo.
 */
export const create = () => {
  let next = 3;
  const store = createStore<TodoState>((set) => ({
    todos: [
      { id: 1, text: 'Read the docs', done: true },
      { id: 2, text: 'Build a widget', done: false },
    ],
    add: (text) => set((state) => ({ todos: [...state.todos, { id: next++, text, done: false }] })),
    toggle: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
      })),
    remove: (id) => set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) })),
  }));

  const item = (todo: Todo) =>
    em.Item({
      shadow: false,
      key: todo.id,
      tag: 'li',
      children: [
        tags.input({
          shadow: false,
          type: 'checkbox',
          checked: todo.done,
          'aria-label': todo.text,
          onchange: () => store.getState().toggle(todo.id),
        }),
        tags.span({ shadow: false, class: todo.done ? 'done' : '', content: todo.text }),
        tags.button({
          shadow: false,
          content: 'Remove',
          onclick: () => store.getState().remove(todo.id),
        }),
      ],
    });

  const list = tags.ul({ shadow: false });
  const input = tags.input({
    shadow: false,
    placeholder: 'What needs doing?',
    'aria-label': 'New to-do',
  });

  return em.Todo({
    shadow: true,
    css,
    mounted: () =>
      store.watch(
        (state) => state.todos,
        (todos) => list.setState({ children: todos.map(item) }),
        {
          fireImmediately: true,
        },
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
        children: [input, tags.button({ shadow: false, type: 'submit', content: 'Add' })],
      }),
      list,
      tags.small({
        shadow: false,
        content: store.select(
          (state) =>
            `${state.todos.filter((todo) => !todo.done).length} left of ${state.todos.length}`,
        ),
      }),
    ],
  });
};
