import { defineWidget, em, signal, tags } from 'ecmact';

const { button, code, div, input, label, option, p, select } = tags;

const css = `
  :host {
    display: grid;
    grid-template-columns: minmax(0, 170px) minmax(0, 1fr);
    gap: 18px;
    color-scheme: light;
    padding: 18px;
    background: #f6f1e4;
    color: #2a2a2a;
    font: 12px/1.6 ui-monospace, Menlo, Consolas, monospace;
  }
  .side {
    min-width: 0;
  }
  .side label {
    display: block;
    margin: 0 0 8px;
  }
  .side input[type='text'],
  .side input[type='number'],
  .side select {
    box-sizing: border-box;
    display: block;
    width: 100%;
    max-width: 190px;
    padding: 3px 6px;
    border: 1px solid #2a2a2a;
    border-radius: 0;
    background: #fff;
    color: #2a2a2a;
    font: inherit;
  }
  .side .check {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .inks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 0 8px;
  }
  .inks button {
    padding: 2px 8px;
    border: 1px solid #2a2a2a;
    border-radius: 0;
    background: #fff;
    color: #2a2a2a;
    font: inherit;
    cursor: pointer;
  }
  .inks button[aria-pressed='true'] {
    background: #2a2a2a;
    color: #fff;
  }
  .inks button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 3px solid #2f5d3a;
    outline-offset: 2px;
  }
  .tag,
  .event {
    margin: 8px 0 0;
    overflow-wrap: anywhere;
  }
  @media (max-width: 520px) {
    :host {
      grid-template-columns: minmax(0, 1fr);
      padding: 14px 12px;
    }
  }
`;

const widgetCss = `
  :host {
    display: block;
    color-scheme: light;
    --ink: var(--packet-ink, #2f5d3a);
  }
  .packet {
    padding: 10px 8px 12px;
    border: 2px solid var(--ink);
    outline: 1px solid var(--ink);
    outline-offset: -6px;
    background: #f3e7c6;
    color: var(--ink);
    font-family: 'Hoefler Text', 'Baskerville', 'Times New Roman', serif;
    text-align: center;
  }
  .co {
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .orn {
    margin: 4px 0;
    color: #8a5f0d;
    font-size: 30px;
    line-height: 1;
  }
  .nm {
    font-size: 24px;
    font-style: italic;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }
  .sow {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--ink);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  button {
    margin-top: 8px;
    padding: 4px 10px;
    border: 1px solid var(--ink);
    border-radius: 0;
    background: var(--ink);
    color: #f3e7c6;
    font: inherit;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 3px solid #2a2a2a;
    outline-offset: 2px;
  }
  .status {
    margin: 8px 0 0;
    min-height: 3.4em;
    font-size: 12px;
    font-style: italic;
  }
`;

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const green = '#2f5d3a';

const inks = [
  { name: 'Green', color: green },
  { name: 'Rust', color: '#9a3b1d' },
  { name: 'Indigo', color: '#2b3a7a' },
];

/**
 * Registers `<seed-packet>` once. The widget reads four attributes, each with the type of its default, tears
 * open with an event that the page can cancel, and draws with a custom property the page can set. `emit` returns
 * `false` when a listener cancelled the event, and the widget says so.
 */
const register = () => {
  if (customElements.get('seed-packet')) return;
  defineWidget(
    'seed-packet',
    ({ props, emit }) => {
      const status = signal('');
      return div(
        { class: 'packet' },
        div({ class: 'co' }, () => (props.organic ? 'Organic heirloom seeds' : 'Heirloom seeds')),
        div({ class: 'orn', 'aria-hidden': 'true' }, '✿'),
        div({ class: 'nm' }, () => props.plant),
        div(
          { class: 'sow' },
          () =>
            `Sow in ${months[Math.min(11, Math.max(0, props.sow - 1))]} · ${Number.isFinite(props.depth) ? props.depth : 1} cm deep`,
        ),
        button(
          {
            type: 'button',
            onclick: () => {
              const taken = emit('sow', { plant: props.plant, month: props.sow });
              status.value = taken
                ? 'Sown. The page took the event.'
                : 'Not now. The page cancelled the event: emit returned false.';
            },
          },
          'Tear open',
        ),
        p({ class: 'status', 'aria-live': 'polite' }, status),
      );
    },
    {
      attributes: { plant: 'Borage', sow: 4, depth: 1, organic: false },
      css: widgetCss,
    },
  );
};

/**
 * The API of `defineWidget` in one place. The packet is a custom element: the controls beside it write its
 * attributes, a button sets a custom property on it, and tearing it open fires `sow`, which the page cancels
 * when it is not the month to sow.
 *
 * @returns The example.
 */
export const create = () => {
  register();
  const plant = signal('Borage');
  const sow = signal(4);
  const depth = signal(1);
  const organic = signal(false);
  const today = signal(4);
  const ink = signal(green);
  const heard = signal('no event yet');

  const monthOptions = () =>
    months.map((name, index) => option({ value: String(index + 1) }, name));

  return em.Seedpacket(
    { css },
    tags['seed-packet']({
      plant,
      sow,
      depth,
      organic,
      style: { '--packet-ink': ink },
      /**
       * Takes the event when it is the month to sow, and cancels it otherwise.
       *
       * @param event - The `sow` event.
       */
      onsow: (event: CustomEvent) => {
        const taken = event.detail.month === today.value;
        if (!taken) event.preventDefault();
        heard.value = `sow: { plant: "${event.detail.plant}", month: ${event.detail.month} } - ${taken ? 'accepted' : 'cancelled by the page'}`;
      },
    }),
    div(
      { class: 'side' },
      label('Plant', input({ type: 'text', bind: plant })),
      label('Sowing month', select({ bind: sow }, monthOptions())),
      label('Depth, cm', input({ type: 'number', min: '1', max: '9', bind: depth })),
      label({ class: 'check' }, input({ type: 'checkbox', bind: organic }), 'Organic'),
      div(
        { class: 'inks', role: 'group', 'aria-label': 'Ink, a custom property' },
        inks.map((choice) =>
          button(
            {
              type: 'button',
              'data-ink': choice.name,
              'aria-pressed': () => String(ink.value === choice.color),
              onclick: () => {
                ink.value = choice.color;
              },
            },
            choice.name,
          ),
        ),
      ),
      label('Today is', select({ bind: today }, monthOptions())),
      p(
        { class: 'tag' },
        code(
          () =>
            `<seed-packet plant="${plant.value}" sow="${sow.value}" depth="${depth.value}"${organic.value ? ' organic' : ''}>`,
        ),
      ),
      p({ class: 'event', 'aria-live': 'polite' }, heard),
    ),
  );
};
