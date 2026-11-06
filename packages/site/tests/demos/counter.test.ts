import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/counter';

afterEach(() => {
  document.body.replaceChildren();
});

describe('counter demo', () => {
  it('counts up and down, and shows the double', () => {
    const demo = create() as HTMLElement;
    document.body.append(demo);
    const root = demo.shadowRoot!;
    const [minus, plus] = [...root.querySelectorAll('button')];
    const output = root.querySelector('output')!;
    expect(output.textContent).toBe('0');
    plus!.click();
    plus!.click();
    plus!.click();
    minus!.click();
    expect(output.textContent).toBe('2');
    expect(root.querySelector('small')?.textContent).toBe('double is 4');
  });
});
