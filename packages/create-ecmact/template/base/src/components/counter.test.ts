import { afterEach, describe, expect, it } from 'vitest';
import { Counter } from './counter';

afterEach(() => {
  document.body.replaceChildren();
});

describe('Counter', () => {
  it('starts at zero and counts clicks', () => {
    const counter = Counter();
    document.body.append(counter);
    const button = counter.shadowRoot?.querySelector('button');

    expect(button?.textContent).toBe('count is 0');
    button?.click();
    button?.click();
    expect(button?.textContent).toBe('count is 2');
  });
});
