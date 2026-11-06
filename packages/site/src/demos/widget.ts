import { computed, defineWidget, em, signal, tags } from 'ecmact';

const css = `
  :host, div { display: block; }
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

/**
 * Registers `<hello-badge>` once: an attribute-driven widget that reports clicks as an event and takes its color
 * from a custom property.
 */
const register = () => {
  if (customElements.get('hello-badge')) return;
  defineWidget(
    'hello-badge',
    ({ props, emit }) =>
      tags.button({
        type: 'button',
        content: computed(
          () => `${props.greeting.value ?? 'Hello'}, ${props.name.value ?? 'world'}!`,
        ),
        style: {
          padding: '0.6rem 1.2rem',
          border: '0',
          borderRadius: '999px',
          color: '#fff',
          font: 'inherit',
          fontWeight: '700',
          cursor: 'pointer',
          background: 'var(--badge-color, #1665e0)',
        },
        onclick: () => emit('greet', { name: props.name.value }),
      }),
    { attributes: ['greeting', 'name'] },
  );
};

/**
 * The API of `defineWidget` in one place. The inputs change the attributes of the element, which update its signals;
 * the color picker sets a custom property from outside; a click comes out as a DOM event, shown below.
 *
 * @returns The demo.
 */
export const create = () => {
  register();
  const log = signal('Click the badge to see its event.');
  const badge = document.createElement('hello-badge');
  badge.setAttribute('name', 'ECMact');
  badge.addEventListener('greet', (event) => {
    log.value = `greet ${JSON.stringify((event as CustomEvent).detail)}`;
  });

  return em.WidgetApi({
    shadow: true,
    css,
    children: [
      tags.div({
        shadow: false,
        class: 'bar',
        children: [
          tags.input({
            shadow: false,
            type: 'text',
            value: 'ECMact',
            'aria-label': 'name attribute',
            oninput: (event) =>
              badge.setAttribute('name', (event.target as HTMLInputElement).value),
          }),
          tags.input({
            shadow: false,
            type: 'text',
            value: 'Hello',
            'aria-label': 'greeting attribute',
            oninput: (event) =>
              badge.setAttribute('greeting', (event.target as HTMLInputElement).value),
          }),
          tags.label({
            shadow: false,
            children: [
              tags.input({
                shadow: false,
                type: 'color',
                value: '#1665e0',
                oninput: (event) =>
                  badge.style.setProperty(
                    '--badge-color',
                    (event.target as HTMLInputElement).value,
                  ),
              }),
              '--badge-color',
            ],
          }),
        ],
      }),
      badge,
      tags.pre({ shadow: false, content: log }),
    ],
  });
};
