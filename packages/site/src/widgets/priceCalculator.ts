import { computed, defineWidget, signal } from 'ecmact';
import { money, part, readNumber, sheet, tag } from '@site/widgets/kit';

const css = `
  :host {
    display: block;
    max-width: 24rem;
    font-family: var(--w-font, 'Segoe UI', system-ui, sans-serif);
    color: var(--w-fg, #f4f1ff);
  }
  .card {
    position: relative;
    overflow: hidden;
    padding: 1.4rem;
    border-radius: var(--w-radius, 22px);
    background:
      radial-gradient(18rem 12rem at 100% 0, color-mix(in srgb, var(--w-accent, #8b5cf6) 55%, transparent), transparent),
      var(--w-bg, linear-gradient(160deg, #1b1340, #0d0a24));
    border: 1px solid var(--w-border, rgba(255, 255, 255, 0.14));
    box-shadow: 0 1.2rem 3rem color-mix(in srgb, var(--w-fg, #f4f1ff) 14%, transparent);
  }
  h3 { margin: 0 0 0.2rem; font-size: 1.05rem; letter-spacing: 0.02em; }
  .sub { margin: 0 0 1.1rem; color: var(--w-muted, rgba(244, 241, 255, 0.65)); font-size: 0.85rem; }
  .seats { display: flex; justify-content: space-between; align-items: baseline; font-size: 0.85rem; }
  .seats b { font-size: 1.3rem; }
  input[type='range'] { width: 100%; margin: 0.4rem 0 1rem; accent-color: var(--w-accent, #8b5cf6); }
  .switch { position: relative; display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; font-size: 0.9rem; cursor: pointer; }
  .switch input { position: absolute; opacity: 0; }
  .track { box-sizing: border-box; display: flex; align-items: center; flex: none; width: 2.6rem; height: 1.45rem; border-radius: 999px; background: color-mix(in srgb, var(--w-fg, #f4f1ff) 24%, transparent); padding: 0.17rem; transition: background 0.2s; }
  .track::after { content: ''; display: block; flex: none; width: 1.11rem; height: 1.11rem; border-radius: 50%; background: #fff; transition: margin 0.2s; }
  .track.on { background: var(--w-accent, #8b5cf6); }
  .track.on::after { margin-inline-start: 1.15rem; }
  .badge { margin-inline-start: auto; padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; background: color-mix(in srgb, var(--w-accent, #8b5cf6) 22%, transparent); color: var(--w-fg, #f4f1ff); }
  .total { display: flex; align-items: baseline; gap: 0.4rem; margin-bottom: 1rem; }
  .total strong { font-size: 2.6rem; line-height: 1; letter-spacing: -0.03em; }
  .total span { color: var(--w-muted, rgba(244, 241, 255, 0.65)); }
  button {
    width: 100%; padding: 0.8rem 1rem; border: 0; border-radius: calc(var(--w-radius, 22px) * 0.6);
    background: var(--w-accent, #8b5cf6); color: #fff; font: inherit; font-weight: 700; cursor: pointer;
  }
  button:hover { filter: brightness(1.12); }
  button:focus-visible, .switch:has(input:focus-visible) .track { outline: 2px solid #fff; outline-offset: 2px; }
`;

/**
 * Registers `<price-calculator>`: a seat slider with a monthly and yearly price and a "Request quote" button.
 * Attributes: `currency` (default `USD`), `base` (price of a seat per month, default `12`; an empty or malformed value counts as the default), `heading`
 * (the title of the card; not `title`, which would also show a tooltip over the whole widget).
 * Event: `quote` with `{ seats, yearly, total, currency }`.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const definePriceCalculator = () =>
  defineWidget(
    'price-calculator',
    ({ host, props, emit }) => {
      const seats = signal(5);
      const yearly = signal(false);
      const currency = computed(() => props.currency.value || 'USD');
      const perSeat = computed(() => readNumber(props.base.value, 12));
      const total = computed(() => {
        const amount = yearly.value
          ? perSeat.value * seats.value * 12 * 0.8
          : perSeat.value * seats.value;
        return Math.round(amount * 100) / 100;
      });
      const root = part(
        'div',
        'card',
        tag('h3', { content: computed(() => props.heading.value ?? 'Team plan') }),
        tag('p', { class: 'sub', content: 'Pay for the seats you use.' }),
        part(
          'div',
          'seats',
          tag('span', { content: 'Seats' }),
          tag('b', { content: computed(() => String(seats.value)) }),
        ),
        tag('input', {
          type: 'range',
          min: 1,
          max: 100,
          value: seats,
          'aria-label': 'Seats',
          /**
           * Takes the number of seats from the slider.
           *
           * @param event - The input event.
           */
          oninput: (event) => {
            seats.value = Number((event.target as HTMLInputElement).value);
          },
        }),
        tag('label', {
          class: 'switch',
          children: [
            tag('input', {
              type: 'checkbox',
              checked: yearly,
              /**
               * Takes the billing period from the switch.
               *
               * @param event - The change event.
               */
              onchange: (event) => {
                yearly.value = (event.target as HTMLInputElement).checked;
              },
            }),
            tag('span', { class: computed(() => (yearly.value ? 'track on' : 'track')) }),
            tag('span', { content: 'Billed yearly' }),
            tag('span', {
              class: 'badge',
              content: computed(() => (yearly.value ? 'Save 20%' : '')),
              hidden: computed(() => !yearly.value),
            }),
          ],
        } as never),
        part(
          'div',
          'total',
          tag('strong', { content: computed(() => money(total.value, currency.value)) }),
          tag('span', { content: computed(() => (yearly.value ? 'per year' : 'per month')) }),
        ),
        tag('button', {
          type: 'button',
          content: 'Request quote',
          /** Announces the quote. */
          onclick: () => {
            emit('quote', {
              seats: seats.value,
              yearly: yearly.value,
              total: total.value,
              currency: currency.value,
            });
          },
        }),
      );
      return sheet(host, css, root);
    },
    { attributes: ['currency', 'base', 'heading'] },
  );
