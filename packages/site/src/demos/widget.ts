import { defineWidget, em, signal, tags } from 'ecmact';

const { button, div, input, label, pre } = tags;

const css = `
  :host { display: block; }
  .bar { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; margin-bottom: 0.9rem; }
  input[type='text'] {
    padding: 0.45rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    width: 9rem;
  }
  label { display: inline-flex; gap: 0.4rem; align-items: center; color: var(--muted); }
  pre { margin: 0.8rem 0 0; font-family: var(--mono); font-size: 0.85rem; color: var(--muted); white-space: pre-wrap; }
`;

const badgeCss = `
  button {
    padding: 0.6rem 1.2rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    background: var(--badge-color, #1665e0);
  }
`;

/**
 * Registers `<hello-badge>` once: an attribute-driven widget that reports clicks as an event and takes its color
 * from a custom property.
 */
const register = () => {
  if (customElements.get('hello-badge')) return;
  defineWidget(
    'hello-badge',
    ({ props, emit }) =>
      button(
        { type: 'button', onclick: () => emit('greet', { name: props.name }) },
        () => `${props.greeting}, ${props.name}!`,
      ),
    { attributes: { greeting: 'Hello', name: 'world' }, css: badgeCss },
  );
};

/**
 * The API of `defineWidget` in one place. The inputs are bound to signals, and the attributes of the element
 * follow those signals; the color picker sets a custom property from outside; a click comes out as a DOM event,
 * shown below.
 *
 * @returns The demo.
 */
export const create = () => {
  register();
  const name = signal('ECMact');
  const greeting = signal('Hello');
  const color = signal('#1665e0');
  const log = signal('Click the badge to see its event.');

  const badge = tags['hello-badge']({
    name,
    greeting,
    style: { '--badge-color': color },
    ongreet: (event: CustomEvent) => {
      log.value = `greet ${JSON.stringify(event.detail)}`;
    },
  });

  return em.WidgetApi(
    { css },
    div(
      { class: 'bar' },
      input({ type: 'text', bind: name, 'aria-label': 'name attribute' }),
      input({ type: 'text', bind: greeting, 'aria-label': 'greeting attribute' }),
      label(input({ type: 'color', bind: color }), '--badge-color'),
    ),
    badge,
    pre(log),
  );
};
