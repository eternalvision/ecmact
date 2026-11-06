import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { definePriceCalculator } from '@site/widgets/priceCalculator';
import { mountWidget } from '@tests/widgets/helpers';

beforeEach(() => {
  vi.useFakeTimers();
  if (!customElements.get('price-calculator')) definePriceCalculator();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('price-calculator', () => {
  it('shows the default plan and the monthly price', async () => {
    const { text } = await mountWidget('price-calculator');
    expect(text()).toContain('Team plan');
    expect(text()).toContain('$60');
    expect(text()).toContain('per month');
  });

  it('reads the title, currency and base price from attributes', async () => {
    const { text } = await mountWidget('price-calculator', {
      title: 'Catering',
      currency: 'EUR',
      base: '10',
    });
    expect(text()).toContain('Catering');
    expect(text()).toMatch(/€\s?50/);
  });

  it('follows the slider and the yearly switch', async () => {
    const { root, text } = await mountWidget('price-calculator');
    const slider = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = '10';
    slider.dispatchEvent(new Event('input'));
    expect(text()).toContain('$120');
    const yearly = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    yearly.checked = true;
    yearly.dispatchEvent(new Event('change'));
    expect(text()).toContain('$1,152');
    expect(text()).toContain('per year');
    expect(text()).toContain('Save 20%');
  });

  it('announces a quote', async () => {
    const { element, root } = await mountWidget('price-calculator');
    const quotes: unknown[] = [];
    element.addEventListener('quote', (event) => quotes.push((event as CustomEvent).detail));
    root.querySelector<HTMLButtonElement>('button')!.click();
    expect(quotes).toEqual([{ seats: 5, yearly: false, total: 60, currency: 'USD' }]);
  });
});
