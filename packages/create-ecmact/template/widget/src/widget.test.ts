import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatPrice } from './widget';

const make = (attributes: Record<string, string> = {}) => {
  const element = document.createElement('price-widget');
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  document.body.append(element);
  return element;
};

const part = (element: Element, selector: string) =>
  element.shadowRoot!.querySelector<HTMLElement>(selector)!;

afterEach(() => {
  document.body.replaceChildren();
});

describe('formatPrice', () => {
  it('formats an amount in a currency', () => {
    expect(formatPrice(5, 'EUR')).toContain('5');
  });

  it('falls back to plain text for an unknown currency', () => {
    expect(formatPrice(5, 'nope')).toBe('5.00 nope');
  });
});

describe('<price-widget>', () => {
  it('shows the label and the total from its attributes', () => {
    const element = make({ price: '10', currency: 'EUR', label: 'Pro plan' });
    expect(part(element, 'h3').textContent).toBe('Pro plan');
    expect(part(element, '.total').textContent).toContain('10');
  });

  it('follows the attributes', () => {
    const element = make({ price: '10', currency: 'EUR' });
    element.setAttribute('price', '20');
    expect(part(element, '.total').textContent).toContain('20');
  });

  it('multiplies the price by the quantity, never below one', () => {
    const element = make({ price: '10', currency: 'EUR' });
    const [less, more] = element.shadowRoot!.querySelectorAll<HTMLElement>('.step');
    more.click();
    expect(part(element, '.total').textContent).toContain('20');
    less.click();
    less.click();
    expect(part(element, '.total').textContent).toContain('10');
  });

  it('tells the page what was added', () => {
    const element = make({ price: '10', currency: 'EUR' });
    const listener = vi.fn();
    document.addEventListener('add', listener);
    part(element, '.add').click();
    document.removeEventListener('add', listener);
    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent<{ quantity: number }>;
    expect(event.detail.quantity).toBe(1);
  });
});
