import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { definePrintQuote } from '@site/widgets/printQuote';
import { mountWidget } from '@tests/widgets/helpers';

definePrintQuote();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/** Reads the price that is shown, for a screen reader. */
const price = (root: ShadowRoot) => root.querySelector('.sr')?.textContent;
/** Reads the digits that are drawn. */
const digits = (root: ShadowRoot) => root.querySelector('.digits')?.textContent;
/** Finds the radio cards of the price breaks. */
const cards = (root: ShadowRoot) => [
  ...root.querySelectorAll<HTMLElement>('.breaks [role="radio"]'),
];
/** Finds the radios of the inks. */
const inks = (root: ShadowRoot) => [...root.querySelectorAll<HTMLElement>('.dots [role="radio"]')];
const checked = (items: HTMLElement[]) =>
  items.findIndex(
    (item) => item.ariaChecked === 'true' || item.getAttribute('aria-checked') === 'true',
  );
const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('print-quote', () => {
  it('shows the default quote: 100 copies, two inks, 120 g, in euros', async () => {
    const { root, text } = await mountWidget('print-quote');
    expect(text()).toContain('Print quote');
    expect(price(root)).toMatch(/€\s?184\.00/);
    expect(digits(root)).toBe('184');
    expect(root.querySelector('sup')?.textContent).toBe('EUR');
    expect(root.querySelector('.per')?.textContent).toMatch(/€1\.84 a copy · two inks · 120 g/);
    expect(checked(cards(root))).toBe(1);
  });

  it('reads the heading, currency and base price from attributes', async () => {
    const { root, text } = await mountWidget('print-quote', {
      heading: 'Flyers',
      currency: 'USD',
      base: '2',
    });
    expect(text()).toContain('Flyers');
    expect(price(root)).toMatch(/\$200\.00/);
    expect(root.querySelector('sup')?.textContent).toBe('USD');
  });

  it('does not take the title attribute, which would show a tooltip over the whole widget', async () => {
    const { text } = await mountWidget('print-quote', { title: 'Tooltip' });
    expect(text()).toContain('Print quote');
    expect(text()).not.toContain('Tooltip');
  });

  it('uses the default for an empty or malformed base and for an empty currency', async () => {
    for (const base of ['', 'abc', '1,5', '-5']) {
      const { root } = await mountWidget('print-quote', { base, currency: ' ' });
      expect(digits(root)).toBe('184');
      expect(root.querySelector('sup')?.textContent).toBe('EUR');
      document.body.replaceChildren();
    }
  });

  it('shows a currency the browser does not know as typed', async () => {
    const { root } = await mountWidget('print-quote', { currency: 'nope' });
    expect(price(root)).toBe('184.00 nope');
    expect(root.querySelector('sup')?.textContent).toBe('nope');
  });

  it('changes the price with each price break, ink and paper', async () => {
    const { root } = await mountWidget('print-quote');
    cards(root)[2]!.click();
    expect(digits(root)).toBe('276');
    expect(cards(root)[2]!.getAttribute('aria-checked')).toBe('true');
    expect(cards(root)[1]!.getAttribute('aria-checked')).toBe('false');
    inks(root)[2]!.click();
    expect(digits(root)).toBe('331');
    expect(root.querySelector('.per')?.textContent).toContain('three inks');
    inks(root)[0]!.click();
    expect(digits(root)).toBe('235');
    const stock = root.querySelector<HTMLSelectElement>('select')!;
    stock.value = '2';
    stock.dispatchEvent(new Event('change'));
    expect(root.querySelector('.per')?.textContent).toContain('170 g');
    expect(digits(root)).toBe('293');
  });

  it('writes the numbers the way the language of the page does', async () => {
    document.documentElement.lang = 'de';
    const { root } = await mountWidget('print-quote', { base: '20' });
    cards(root)[3]!.click();
    expect(digits(root)).toBe('4.700');
    document.documentElement.lang = '';
  });

  it('moves the price breaks with the arrow keys, wraps and always keeps one chosen', async () => {
    const { root } = await mountWidget('print-quote');
    const group = root.querySelector('.breaks')!;
    press(cards(root)[1]!, 'ArrowRight');
    expect(checked(cards(root))).toBe(2);
    expect(cards(root).map((card) => card.tabIndex)).toEqual([-1, -1, 0, -1]);
    press(cards(root)[2]!, 'ArrowDown');
    press(cards(root)[3]!, 'ArrowRight');
    expect(checked(cards(root))).toBe(0);
    press(cards(root)[0]!, 'ArrowLeft');
    expect(checked(cards(root))).toBe(3);
    press(cards(root)[3]!, 'ArrowUp');
    expect(checked(cards(root))).toBe(2);
    press(group, 'Home');
    expect(checked(cards(root))).toBe(0);
    press(group, 'End');
    expect(checked(cards(root))).toBe(3);
    const stay = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    cards(root)[3]!.dispatchEvent(stay);
    expect(stay.defaultPrevented).toBe(false);
    expect(checked(cards(root))).toBe(3);
  });

  it('moves the inks with the arrow keys too', async () => {
    const { root } = await mountWidget('print-quote');
    press(inks(root)[1]!, 'ArrowRight');
    expect(checked(inks(root))).toBe(2);
    press(inks(root)[2]!, 'ArrowRight');
    expect(checked(inks(root))).toBe(0);
  });

  it('announces a quote with an amount rounded to cents', async () => {
    const quotes: unknown[] = [];
    const { root } = await mountWidget(
      'print-quote',
      { base: '1.999', currency: 'USD' },
      { quote: (event) => quotes.push(event.detail) },
    );
    root.querySelector<HTMLButtonElement>('.stub button')!.click();
    expect(quotes).toEqual([
      { copies: 100, inks: 2, stock: 120, perCopy: 2, total: 199.9, currency: 'USD' },
    ]);
  });

  it('draws the ticket as a plain rounded card where masks are not supported', async () => {
    const { element } = await mountWidget('print-quote');
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])];
    const plain = rules.filter((rule) => rule.cssText.startsWith('.ticket'));
    expect(plain.some((rule) => rule.cssText.includes('box-shadow: inset 0 0 0 3px'))).toBe(true);
    const guarded = rules.find((rule) => rule.cssText.startsWith('@supports'));
    expect(guarded?.cssText).toContain('mask');
    expect(plain.every((rule) => !rule.cssText.includes('mask'))).toBe(true);
  });

  it('is hidden by the hidden attribute, whatever display the widget sets', async () => {
    const { element } = await mountWidget('print-quote', { hidden: '' });
    const sheet = element.shadowRoot?.adoptedStyleSheets[0];
    const rules = [...(sheet?.cssRules ?? [])].map((rule) => rule.cssText).join(' ');
    expect(rules).toContain(':host([hidden])');
  });
});
