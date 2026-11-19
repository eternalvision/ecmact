import { defineWidget, em, signal, tags } from 'ecmact';

const { button, code, div, input, label, option, p, select } = tags;

const css = `
  :host {
    display: grid;
    grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    color-scheme: light;
    padding: 20px 18px;
    background:
      radial-gradient(rgba(14, 122, 70, 0.28) 2px, transparent 2.6px) 0 0 / 26px 26px,
      radial-gradient(rgba(255, 138, 31, 0.5) 2px, transparent 2.6px) 13px 9px / 26px 26px,
      #eaf8ee;
    color: #14321f;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  .side {
    display: grid;
    gap: 9px;
    min-width: 0;
    padding: 14px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 6px 16px rgba(14, 90, 50, 0.14);
    font-size: 13.5px;
    font-weight: 600;
  }
  .side label {
    display: grid;
    gap: 4px;
  }
  .side input:not([type='checkbox']),
  .side select {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: 36px;
    padding: 0 10px;
    border: 0;
    border-radius: 10px;
    background: #eef4f0;
    color: #14321f;
    font: inherit;
    font-size: 15px;
    font-weight: 500;
  }
  .side .check {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .side input[type='checkbox'] {
    width: 24px;
    height: 24px;
    margin: 0;
    accent-color: #0e7a46;
  }
  .inks {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 4px 0;
  }
  .inks button {
    min-height: 30px;
    padding: 0 14px;
    border: 0;
    border-radius: 999px;
    color: #ffffff;
    font: inherit;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .inks button[data-ink='Green'] {
    background: #0e7a46;
  }
  .inks button[data-ink='Rust'] {
    background: #c92a1e;
  }
  .inks button[data-ink='Indigo'] {
    background: #6d28d9;
  }
  .inks button[aria-pressed='true'] {
    box-shadow:
      0 0 0 3px #ffffff,
      0 0 0 5.5px #14321f;
  }
  .tag {
    margin: 0;
    padding: 8px 10px;
    border-radius: 10px;
    background: #14321f;
    color: #b9f5cf;
    font-size: 13px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .event {
    margin: 0;
    font-size: 13.5px;
    overflow-wrap: anywhere;
  }
  :focus-visible {
    outline: 3px solid #14321f;
    outline-offset: 3px;
  }
  @media (max-width: 520px) {
    :host {
      grid-template-columns: minmax(0, 1fr);
      padding: 18px 14px;
    }
  }
`;

const widgetCss = `
  :host {
    display: block;
    color-scheme: light;
    --ink: var(--packet-ink, #0e7a46);
    filter: drop-shadow(0 8px 12px rgba(14, 90, 50, 0.28));
  }
  .packet {
    --s: 8px;
    padding: 22px 12px 16px;
    border-radius: 0 0 14px 14px;
    background: #ffffff;
    color: var(--ink);
    font-family: Superclarendon, 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', Georgia, serif;
    text-align: center;
    -webkit-mask: conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(2 * var(--s)) 100%;
    mask: conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(2 * var(--s)) 100%;
  }
  .co {
    font-size: 13.5px;
    font-style: italic;
  }
  .orn {
    display: grid;
    place-items: center;
    width: 74px;
    height: 74px;
    margin: 10px auto 8px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ink) 10%, #ffffff);
    font-size: 42px;
    line-height: 1;
  }
  .nm {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.05;
    overflow-wrap: anywhere;
  }
  .sow {
    margin-top: 4px;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 13.5px;
    font-weight: 600;
  }
  button {
    min-height: 38px;
    margin-top: 12px;
    padding: 0 18px;
    border: 0;
    border-radius: 999px;
    background: var(--ink);
    color: #ffffff;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
  }
  :focus-visible {
    outline: 3px solid #14321f;
    outline-offset: 3px;
  }
  .status {
    margin: 8px 0 0;
    min-height: 3.4em;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    font-weight: 600;
  }
  .packet:has(.status:not(:empty)) {
    transform: rotate(-2deg);
    transform-origin: 50% 0;
  }
  @media (prefers-reduced-motion: no-preference) {
    .packet {
      transition: transform 0.35s cubic-bezier(0.2, 1.4, 0.4, 1);
    }
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

const green = '#0e7a46';

const inks = [
  { name: 'Green', color: green },
  { name: 'Rust', color: '#c92a1e' },
  { name: 'Indigo', color: '#6d28d9' },
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
