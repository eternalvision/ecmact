import { defineWidget, signal, tags } from 'ecmact';
import { money, readNumber, widgetCss } from '@site/widgets/kit';

const { b, button, div, h3, input, label, p, span, strong } = tags;

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
    ({ props, emit }) => {
      const seats = signal(5);
      const yearly = signal(false);
      /**
       * Reads the currency: the attribute, or dollars when it is empty.
       *
       * @returns The ISO 4217 code.
       */
      const currency = () => props.currency || 'USD';
      /**
       * Counts the price of the seats for the chosen period; a year costs a fifth less.
       *
       * @returns The amount, rounded to cents.
       */
      const total = () => {
        const perSeat = readNumber(props.base, 12);
        const amount = yearly.value ? perSeat * seats.value * 12 * 0.8 : perSeat * seats.value;
        return Math.round(amount * 100) / 100;
      };

      return div(
        { class: 'card' },
        h3(() => props.heading),
        p({ class: 'sub' }, 'Pay for the seats you use.'),
        div({ class: 'seats' }, span('Seats'), b(seats)),
        input({ type: 'range', min: 1, max: 100, bind: seats, 'aria-label': 'Seats' }),
        label(
          { class: 'switch' },
          input({ type: 'checkbox', bind: yearly }),
          span({ class: ['track', { on: yearly }] }),
          span('Billed yearly'),
          () => yearly.value && span({ class: 'badge' }, 'Save 20%'),
        ),
        div(
          { class: 'total' },
          strong(() => money(total(), currency())),
          span(() => (yearly.value ? 'per year' : 'per month')),
        ),
        button(
          {
            type: 'button',
            /** Announces the quote. */
            onclick: () => {
              emit('quote', {
                seats: seats.value,
                yearly: yearly.value,
                total: total(),
                currency: currency(),
              });
            },
          },
          'Request quote',
        ),
      );
    },
    { attributes: { currency: 'USD', base: '12', heading: 'Team plan' }, css: widgetCss(css) },
  );
