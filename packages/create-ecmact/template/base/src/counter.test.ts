import { expect, it } from 'vitest';
import { createCounter } from './counter';

it('counts clicks', () => {
  const counter = createCounter();
  document.body.append(counter);
  const button = counter.shadowRoot?.firstElementChild as HTMLButtonElement;
  button.click();
  button.click();
  expect(button.textContent).toBe('Clicked 2 times');
});
