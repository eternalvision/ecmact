import { describe, expect, it } from 'vitest';
import { defineAll } from '@site/widgets/index';

const tags = ['price-calculator', 'weather-now', 'repo-card', 'poll-widget', 'countdown-timer'];

describe('defineAll', () => {
  it('registers every widget, and does nothing the second time', () => {
    defineAll();
    tags.forEach((name) => expect(customElements.get(name)).toBeDefined());
    expect(() => defineAll()).not.toThrow();
  });
});
