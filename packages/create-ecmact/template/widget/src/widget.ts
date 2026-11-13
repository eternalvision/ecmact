import { computed, defineWidget, signal, tags } from 'ecmact';

const { button, div, h3, p, section, span } = tags;

const css = `
  :host {
    display: block;
    max-width: 20rem;
    font-family: var(--widget-font, system-ui, sans-serif);
    color: var(--widget-text, #0d2342);
  }
  .card {
    display: grid;
    gap: 0.9rem;
    padding: 1.25rem;
    border: 1px solid var(--widget-border, #cddff7);
    border-radius: var(--widget-radius, 16px);
    background: var(--widget-bg, #ffffff);
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .step {
    width: 2.2rem;
    height: 2.2rem;
    border: 1px solid var(--widget-border, #cddff7);
    border-radius: 10px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .total {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .add {
    padding: 0.7rem 1rem;
    border: 0;
    border-radius: 12px;
    background: var(--widget-accent, #1665e0);
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  .add:focus-visible,
  .step:focus-visible {
    outline: 2px solid var(--widget-accent, #1665e0);
    outline-offset: 2px;
  }
`;

/**
 * Formats an amount in a currency, falling back to plain text for a currency the browser does not know.
 *
 * @param amount - The amount.
 * @param currency - An ISO 4217 code such as `EUR`.
 * @returns The formatted amount.
 */
export const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * `<price-widget price="49" currency="EUR" label="Pro plan">`: a quantity picker with a total and an
 * "Add to cart" button. The page configures it through attributes and CSS custom properties
 * (`--widget-accent`, `--widget-bg`, `--widget-text`, `--widget-border`, `--widget-radius`, `--widget-font`),
 * and hears about the result through the `add` event.
 */
defineWidget(
  'price-widget',
  ({ props, emit }) => {
    const quantity = signal(1);
    const total = computed(() => formatPrice(props.price * quantity.value, props.currency));
    const stepper = (label: string, change: number) =>
      button(
        {
          class: 'step',
          type: 'button',
          'aria-label': label,
          onclick: () => {
            quantity.value = Math.max(1, quantity.value + change);
          },
        },
        change > 0 ? '+' : '-',
      );
    return section(
      { class: 'card' },
      h3(() => props.label),
      div(
        { class: 'row' },
        stepper('Decrease quantity', -1),
        span(quantity),
        stepper('Increase quantity', 1),
      ),
      p({ class: 'total' }, total),
      button(
        {
          class: 'add',
          type: 'button',
          onclick: () => emit('add', { quantity: quantity.value, total: total.value }),
        },
        'Add to cart',
      ),
    );
  },
  { attributes: { price: 0, currency: 'USD', label: 'Product' }, css },
);
