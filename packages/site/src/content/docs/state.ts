import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The store: createStore, selectors, persist, devtools, combine, shallow. */
export const page: DocPage = {
  slug: 'state',
  title: 'State management',
  summary: 'A zustand-style store with selectors as signals, persistence and Redux DevTools.',
  group: 'Application',
  blocks: [
    p(
      "`createStore` makes a store: a state, the functions that change it, and ways to follow it. It is modeled on zustand and works with ECMact's signals, so components follow a store without any glue. The store is plain JavaScript and works anywhere.",
    ),
    demo('store'),
    code(
      'ts',
      `
import { createStore, mount, tags } from 'ecmact';

interface CounterState {
  count: number;
  inc: () => void;
}

const counter = createStore<CounterState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

mount(
  '#app',
  tags.button({
    content: counter.select((state) => \`count is \${state.count}\`),
    onclick: () => counter.getState().inc(),
  }),
);
`,
    ),
    h2('The store'),
    table(
      ['Member', 'Description'],
      [
        '`getState()`, `getInitialState()`',
        'The current state, and the one the store was created with.',
      ],
      [
        '`setState(partial, replace?)`',
        'Shallow-merges an object (or what a function of the state returns). `replace: true` replaces the state.',
      ],
      [
        '`subscribe(listener)`',
        'Calls `listener(state, previous)` after every change. Returns a function that stops it.',
      ],
      [
        '`watch(selector, listener, options?)`',
        'Like `subscribe`, but only when the selected value changes. Options: `equalityFn`, `fireImmediately`.',
      ],
      [
        '`select(selector, equalityFn?)`',
        'A **signal** of a part of the state, for props and effects.',
      ],
      ['`state`', 'The whole state as a signal.'],
    ),
    ul(
      '`setState` does nothing, and notifies nobody, when the new state is the same value as the old one.',
      'A selector that builds a new object each time would change on every update: pass `shallow` as the second argument so that only a change of content counts.',
      '`set` and `get` must not be called while the creator is still running, only afterwards, for example in an action.',
    ),
    h2('Middleware'),
    p(
      'A middleware wraps the creator. `combine` takes the initial values separately so that their types are inferred. `persist` keeps the state in a storage. `devtools` connects the store to the Redux DevTools browser extension.',
    ),
    code(
      'ts',
      `
import { combine, createStore, devtools, persist } from 'ecmact';

const cart = createStore(
  devtools(
    persist(
      combine({ items: [] as string[] }, (set) => ({
        add: (item: string) => set((state) => ({ items: [...state.items, item] }), false, 'cart/add'),
      })),
      { name: 'cart', partialize: (state) => ({ items: state.items }) },
    ),
    { name: 'cart' },
  ),
);
`,
    ),
    table(
      ['`persist` option', 'Description'],
      ['`name`', 'The key in the storage. Required.'],
      [
        '`storage`',
        '`createJSONStorage(() => sessionStorage)`, or any `{ getItem, setItem, removeItem }`, asynchronous ones included. Defaults to `localStorage`.',
      ],
      ['`partialize`', 'Picks what to persist.'],
      [
        '`version`, `migrate`',
        'A stored state with another version is ignored unless `migrate` converts it.',
      ],
      ['`merge`', 'Combines the stored state with the current one. Defaults to a shallow merge.'],
      [
        '`skipHydration`',
        'Do not read the storage on creation; call `store.persist.rehydrate()` yourself.',
      ],
      ['`onRehydrateStorage`', 'Called before and after the storage is read.'],
    ),
    callout(
      'note',
      'Differences from zustand: there is no React hook, `select` returns a signal instead. `subscribeWithSelector` is built in as `watch`. There is no `immer` middleware, because ECMact has no dependencies.',
    ),
  ],
};
