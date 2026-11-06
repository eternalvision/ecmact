import { computed, defineWidget, em, signal, tags } from 'ecmact';

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
    const total = computed(() =>
      formatPrice(Number(props.price.value ?? 0) * quantity.value, props.currency.value ?? 'USD'),
    );
    const stepper = (label: string, change: number) =>
      tags.button({
        class: 'step',
        type: 'button',
        content: change > 0 ? '+' : '-',
        'aria-label': label,
        shadow: false,
        onclick: () => {
          quantity.value = Math.max(1, quantity.value + change);
        },
      });
    const style = document.createElement('style');
    style.textContent = css;
    const card = em.Card({
      tag: 'section',
      class: 'card',
      shadow: false,
      children: [
        tags.h3({ content: computed(() => props.label.value ?? 'Product'), shadow: false }),
        tags.div({
          class: 'row',
          shadow: false,
          children: [
            stepper('Decrease quantity', -1),
            tags.span({ content: computed(() => String(quantity.value)), shadow: false }),
            stepper('Increase quantity', 1),
          ],
        }),
        tags.p({ class: 'total', content: total, shadow: false }),
        tags.button({
          class: 'add',
          type: 'button',
          content: 'Add to cart',
          shadow: false,
          onclick: () => emit('add', { quantity: quantity.value, total: total.value }),
        }),
      ],
    });
    const fragment = document.createDocumentFragment();
    fragment.append(style, card);
    return fragment;
  },
  { attributes: ['price', 'currency', 'label'] },
);
