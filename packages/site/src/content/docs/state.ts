import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** The store: createStore, fields and actions, selectors, persistence and DevTools. */
export const page: DocPage = {
  slug: 'state',
  title: 'State management',
  summary:
    'A store with its fields and actions as plain properties, persistence and Redux DevTools.',
  group: 'Application',
  blocks: [
    p(
      '`createStore(initial, actions, options)` makes a store from its initial values and the actions that change them. Both become properties of the store: `counter.count` reads a value and `counter.inc()` calls an action. Types are inferred from the two arguments.',
    ),
    demo('store'),
    code(
      'ts',
      `
import { createStore, mount, tags } from 'ecmact';

const { button, p } = tags;

const counter = createStore({ count: 0, step: 1 }, (set, get) => ({
  inc: () => set((state) => ({ count: state.count + state.step })),
  reset: () => set({ count: 0 }),
  double: () => set({ count: get().count * 2 }),
}));

mount(
  '#app',
  button({ onclick: () => counter.inc() }, () => \`count is \${counter.count}\`),
  button({ onclick: () => counter.reset() }, 'Reset'),
  button({ onclick: () => counter.double() }, 'Double'),
  p(() => (counter.count % 2 === 0 ? 'even' : 'odd')),
);
`,
    ),
    ul(
      'Reading a field inside a reactive function, an effect or a computed value follows that field only. A change of `step` does not rerun a function that read `count`.',
      '`set` shallow-merges an object, or what a function of the state returns, into the values. `get` reads the values.',
      '`set`, `get` and the third argument, the store, are typed with the values only. To call another action from an action, go through the store variable: `counter.reset()`.',
      'The state must be an object. Declare every field in the initial values: only they become properties of the store.',
      'A field or an action cannot have a name that the store uses itself, such as `state`, `select` or `subscribe`. `createStore` throws for such a name.',
    ),
    h2('The store'),
    table(
      ['Member', 'Description'],
      ['fields and actions', 'Plain properties. Fields are read-only: change them in an action.'],
      [
        '`getState()`, `getInitialState()`',
        'The current state with the actions, and the one the store was created with.',
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
        'A **signal** of a derived part of the state, for values that are not one field.',
      ],
      ['`state`', 'The whole state as a signal.'],
      ['`persist`', 'Present when the store is persisted, see below.'],
    ),
    code(
      'ts',
      `
import { createStore, shallow } from 'ecmact';

const cart = createStore({ items: [] as { title: string; price: number }[], coupon: '' }, (set) => ({
  add: (title: string, price: number) =>
    set((state) => ({ items: [...state.items, { title, price }] })),
}));

const total = cart.select((state) => state.items.reduce((sum, item) => sum + item.price, 0));
const titles = cart.select((state) => state.items.map((item) => item.title), shallow);

const stop = cart.watch(
  (state) => state.items.length,
  (length, previous) => console.log(\`\${previous} -> \${length}\`),
);

cart.add('Book', 12);
console.log(total.value, titles.value);
stop();
`,
    ),
    ul(
      '`setState` does nothing, and notifies nobody, when the new state is the same value as the old one.',
      'A selector that builds a new object or array each time would change on every update: pass `shallow` as the second argument so that only a change of content counts.',
      'Call `set` and `get` inside the actions, not while the actions are being built.',
    ),
    h2('Persistence and DevTools'),
    p(
      'The third argument holds the options. `persist` keeps the state in a storage and reads it back when the store is created. `devtools` shows the store in the Redux DevTools browser extension, with every change named after the action that made it.',
    ),
    code(
      'ts',
      `
import { createJSONStorage, createStore } from 'ecmact';

const cart = createStore(
  { items: [] as string[], open: false },
  (set) => ({
    add: (item: string) => set((state) => ({ items: [...state.items, item] })),
    toggle: () => set((state) => ({ open: !state.open })),
  }),
  {
    persist: {
      name: 'cart',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }),
    },
    devtools: { name: 'cart' },
  },
);

cart.add('book');
`,
    ),
    table(
      ['`persist` option', 'Description'],
      ['`name`', 'The key in the storage. Required.'],
      [
        '`storage`',
        '`createJSONStorage(() => sessionStorage)`, or any `{ getItem, setItem, removeItem }`, asynchronous ones included. Defaults to `localStorage`.',
      ],
      ['`partialize`', 'Picks what to persist. Defaults to the whole state.'],
      [
        '`version`, `migrate`',
        'A stored state with another version is ignored unless `migrate` converts it.',
      ],
      ['`merge`', 'Combines the stored state with the current one. Defaults to a shallow merge.'],
      [
        '`skipHydration`',
        'Do not read the storage on creation; call `store.persist.rehydrate()` yourself.',
      ],
      [
        '`onRehydrateStorage`',
        'Called before the storage is read; may return a function to call after.',
      ],
    ),
    p(
      'A persisted store has a `persist` property with `rehydrate()`, `hasHydrated()`, `clearStorage()`, `onHydrate(listener)`, `onFinishHydration(listener)`, `getOptions()` and `setOptions(options)`.',
    ),
    table(
      ['`devtools` value', 'Description'],
      ['`true`', 'Connects with the defaults.'],
      ['`name`', 'The name of the connection. Changes are then named `name/action`.'],
      ['`enabled`', '`false` turns the connection off, for production builds.'],
      [
        '`anonymousActionType`',
        'The name for changes made outside an action, with `setState`. Defaults to `anonymous`.',
      ],
    ),
    p('Without the extension in the browser the store works as usual.'),
    callout(
      'note',
      'Differences from zustand: there is no React hook, fields are properties and `select` returns a signal. Actions are passed apart from the values. `persist` and `devtools` are options, not middleware, and `subscribeWithSelector` is built in as `watch`. There is no `immer`, because ECMact has no dependencies.',
    ),
  ],
};
