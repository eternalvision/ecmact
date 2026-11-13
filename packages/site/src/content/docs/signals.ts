import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Signals, computed values, effects and how the markup follows them. */
export const page: DocPage = {
  slug: 'signals',
  title: 'Signals',
  summary:
    'Push-based reactive values: signal, computed, effect, batch, and markup that follows them.',
  group: 'Core',
  blocks: [
    p(
      'A signal holds a value and tells whoever read it when it changes. Children and props read signals, and the DOM updates on its own: no tree is rendered again, only the text, attribute or style that depends on the value.',
    ),
    demo('counter'),
    h2('The API'),
    table(
      ['Function', 'What it does'],
      [
        '`signal(value)`',
        'A value that can be read and written through `.value`. `.peek()` reads without subscribing. `.subscribe(listener)` calls a listener on every change.',
      ],
      [
        '`computed(fn, equals?)`',
        'A read-only value derived from other signals. It is lazy and memoized. With `equals`, an equal result keeps the old value and does not notify.',
      ],
      [
        '`effect(fn)`',
        'Runs now and again whenever a signal it read changes. Returns a function that stops it.',
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

const stop = effect(() => {
  console.log(full.value);
});

batch(() => {
  first.value = 'Grace';
  last.value = 'Hopper';
});

stop();
`,
    ),
    h2('Signals in markup'),
    p(
      'A child or a prop can be a function that reads signals. It runs again when one of them changes. You do not need `computed` for that: write the expression where it is used. A signal can also be passed as it is.',
    ),
    code(
      'ts',
      `
import { mount, signal, tags } from 'ecmact';

const { h1, input } = tags;

const name = signal('world');

mount(
  '#app',
  h1(
    { style: { color: () => (name.value === 'world' ? 'gray' : 'teal') }, title: name },
    () => \`Hello, \${name.value}\`,
  ),
  input({ bind: name }),
);
`,
    ),
    p(
      'What can be reactive is listed in [Elements and components](/docs/components). How long an element follows its signals is described in [Lifecycle](/docs/lifecycle).',
    ),
    h2('Rules'),
    ul(
      'Reading `.value` inside an effect, a computed value or a reactive function subscribes it. Reading inside `untracked`, or through `.peek()`, does not.',
      'An effect runs once immediately. Dependencies are collected anew on every run, so conditional reads work.',
      'Writing the same value (by `Object.is`) does nothing and notifies nobody.',
      'An effect that throws surfaces the error from the write that triggered it.',
      'An effect created inside the `mounted` hook of a component, or inside the `render` of a widget, is stopped for you when the element leaves the document.',
    ),
    callout(
      'warning',
      'The function of an effect must return nothing or a cleanup function. The cleanup runs before the next run and when the effect is stopped. An arrow function with an expression body returns the value of the expression: `effect(() => (total.value = price.value * 2))` returns a number. Use a block body: `effect(() => { total.value = price.value * 2; })`.',
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
import { computed, shallow, signal } from 'ecmact';

const pointer = signal({ x: 0, y: 0, pressed: false });

const position = computed(() => ({ x: pointer.value.x, y: pointer.value.y }), shallow);

pointer.value = { ...pointer.value, pressed: true };
`,
    ),
    p('The last line changes `pointer`, but `position` keeps its value and notifies nobody.'),
  ],
};
