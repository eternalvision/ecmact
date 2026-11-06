import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { definePriceCalculator } from '@site/widgets/priceCalculator';
import { mountWidget } from '@tests/widgets/helpers';

definePriceCalculator();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/**
 * Reads the price that is shown.
 *
 * @param root - The shadow root of the widget.
 * @returns The text of the price.
 */
const price = (root: ShadowRoot) => root.querySelector('.total strong')?.textContent;

describe('price-calculator', () => {
  it('shows the default plan and the monthly price', async () => {
    const { root, text } = await mountWidget('price-calculator');
    expect(text()).toContain('Team plan');
    expect(price(root)).toBe('$60');
    expect(text()).toContain('per month');
  });

  it('reads the heading, currency and base price from attributes', async () => {
    const { root, text } = await mountWidget('price-calculator', {
      heading: 'Catering',
      currency: 'EUR',
      base: '10',
    });
    expect(text()).toContain('Catering');
    expect(price(root)).toMatch(/€\s?50/);
  });

  it('does not take the title attribute, which would show a tooltip over the whole widget', async () => {
    const { text } = await mountWidget('price-calculator', { title: 'Tooltip' });
    expect(text()).toContain('Team plan');
    expect(text()).not.toContain('Tooltip');
  });

  it('uses the default for an empty or malformed base and for an empty currency', async () => {
    for (const base of ['', 'abc', '1,5', '-5']) {
      const { root } = await mountWidget('price-calculator', { base, currency: '' });
      expect(price(root)).toBe('$60');
      document.body.replaceChildren();
    }
  });

  it('follows the slider and the yearly switch', async () => {
    const { root, text } = await mountWidget('price-calculator');
    const slider = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    slider.value = '10';
    slider.dispatchEvent(new Event('input'));
    expect(price(root)).toBe('$120');
    const yearly = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    yearly.checked = true;
    yearly.dispatchEvent(new Event('change'));
    expect(price(root)).toBe('$1,152');
    expect(text()).toContain('per year');
    expect(text()).toContain('Save 20%');
    expect(root.querySelector('.track')?.classList.contains('on')).toBe(true);
    yearly.checked = false;
    yearly.dispatchEvent(new Event('change'));
    expect(root.querySelector('.track')?.classList.contains('on')).toBe(false);
  });

  it('announces a quote with an amount rounded to cents', async () => {
    const quotes: unknown[] = [];
    const { root } = await mountWidget(
      'price-calculator',
      { base: '9.99' },
      { quote: (event) => quotes.push(event.detail) },
    );
    root.querySelector<HTMLButtonElement>('button')!.click();
    expect(quotes).toEqual([{ seats: 5, yearly: false, total: 49.95, currency: 'USD' }]);
  });

  it('is hidden by the hidden attribute, whatever display the widget sets', async () => {
    const { element } = await mountWidget('price-calculator', { hidden: '' });
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])].map((rule) => rule.cssText).join(' ');
    expect(rules).toContain(':host([hidden])');
  });
});
