import { computed, defineWidget, signal } from 'ecmact';
import { tag } from '@site/lib/component';
import { money, part, sheet } from '@site/widgets/kit';

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
  .switch { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; font-size: 0.9rem; cursor: pointer; }
  .switch input { position: absolute; opacity: 0; }
  .track { width: 2.6rem; height: 1.45rem; border-radius: 999px; background: color-mix(in srgb, var(--w-fg, #f4f1ff) 24%, transparent); padding: 0.17rem; transition: background 0.2s; }
  .track::after { content: ''; display: block; width: 1.11rem; height: 1.11rem; border-radius: 50%; background: #fff; transition: transform 0.2s; }
  .switch input:checked + .track { background: var(--w-accent, #8b5cf6); }
  .switch input:checked + .track::after { transform: translateX(1.15rem); }
  .badge { margin-left: auto; padding: 0.1rem 0.5rem; border-radius: 999px; font-size: 0.75rem; background: color-mix(in srgb, var(--w-accent, #8b5cf6) 22%, transparent); color: var(--w-accent, #8b5cf6); }
  .total { display: flex; align-items: baseline; gap: 0.4rem; margin-bottom: 1rem; }
  .total strong { font-size: 2.6rem; line-height: 1; letter-spacing: -0.03em; }
  .total span { color: var(--w-muted, rgba(244, 241, 255, 0.65)); }
  button {
    width: 100%; padding: 0.8rem 1rem; border: 0; border-radius: calc(var(--w-radius, 22px) * 0.6);
    background: var(--w-accent, #8b5cf6); color: #fff; font: inherit; font-weight: 700; cursor: pointer;
  }
  button:hover { filter: brightness(1.12); }
  button:focus-visible, input:focus-visible + .track { outline: 2px solid #fff; outline-offset: 2px; }
`;

/**
 * Registers `<price-calculator>`: a seat slider with a monthly and yearly price and a "Request quote" button.
 * Attributes: `currency` (default `USD`), `base` (price of a seat per month, default `12`), `title`.
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
      const currency = computed(() => props.currency.value ?? 'USD');
      const perSeat = computed(() => Number(props.base.value ?? 12));
      const total = computed(() =>
        yearly.value ? perSeat.value * seats.value * 12 * 0.8 : perSeat.value * seats.value,
      );
      const root = part(
        'div',
        'card',
        tag('h3', { content: computed(() => props.title.value ?? 'Team plan') }),
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
              onchange: (event) => {
                yearly.value = (event.target as HTMLInputElement).checked;
              },
            }),
            part('span', 'track'),
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
      return sheet(css, root);
    },
    { attributes: ['currency', 'base', 'title'] },
  );
