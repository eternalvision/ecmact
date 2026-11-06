import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Signals, computed values, effects and how props follow them. */
export const page: DocPage = {
  slug: 'signals',
  title: 'Signals',
  summary:
    'Push-based reactive values: signal, computed, effect, batch, and props that follow them.',
  group: 'Core',
  blocks: [
    p(
      'A signal holds a value and tells whoever read it when it changes. Components bind props to signals and the DOM updates on its own: no re-render of a tree, only the node that depends on the value.',
    ),
    demo('counter'),
    h2('The API'),
    table(
      ['Function', 'What it does'],
      [
        '`signal(value)`',
        'A value that can be read and written through `.value`. `.peek()` reads without subscribing.',
      ],
      [
        '`computed(fn, equals?)`',
        'A read-only value derived from other signals. It is lazy and memoized. With `equals`, an equal result keeps the old value and does not notify.',
      ],
      [
        '`effect(fn)`',
        'Runs now and again whenever a signal it read changes. `fn` may return a cleanup. Returns a function that stops it.',
      ],
      ['`batch(fn)`', 'Groups writes: effects run once, after the last one.'],
      ['`untracked(fn)`', 'Reads signals inside `fn` without subscribing.'],
      ['`isSignal(value)`', 'A type guard for signals and computed values.'],
    ),
    code(
      'ts',
      `
import { batch, computed, effect, signal } from 'ecmact';

const first = signal('Ada');
const last = signal('Lovelace');
const full = computed(() => \`\${first.value} \${last.value}\`);

const stop = effect(() => console.log(full.value));

batch(() => {
  first.value = 'Grace';
  last.value = 'Hopper';
});

stop();
`,
    ),
    h2('Props that follow signals'),
    p(
      'These props accept a signal wherever a plain value goes: `content`, `html`, `css`, `style` (the object, or each of its values), attributes, and text items of `children`. The component subscribes while it is in the document and stops when it is removed, so there is nothing to clean up.',
    ),
    code(
      'ts',
      `
const name = signal('world');

mount(
  '#app',
  tags.h1({
    content: computed(() => \`Hello, \${name.value}\`),
    style: { color: computed(() => (name.value === 'world' ? 'gray' : 'teal')) },
    title: name,
  }),
);

name.value = 'ECMact';
`,
    ),
    h2('Rules of the road'),
    ul(
      'Reading `.value` inside an effect or a computed subscribes it. Reading inside `untracked` does not.',
      'An effect runs once immediately. Dependencies are collected anew on every run, so conditional reads work.',
      'Writing the same value (by `Object.is`) does nothing and notifies nobody.',
      'An effect that throws surfaces the error from the write that triggered it.',
    ),
    callout(
      'tip',
      'A signal that holds an object changes only when you assign a new object. Replace instead of mutating: `list.value = [...list.value, item]`.',
    ),
    h2('Equality for derived values'),
    p(
      'A `computed` normally notifies its readers whenever a dependency changed. Pass `equals` and a result that is equal to the previous one is dropped, so a selector over a big object does not wake up readers for unrelated changes. The store builds `select` on this.',
    ),
    code(
      'ts',
      `
import { shallow } from 'ecmact';

const point = computed(
  () => ({ x: state.value.x, y: state.value.y }),
  shallow,
);
`,
    ),
  ],
};
