import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/context';

afterEach(() => {
  document.body.replaceChildren();
});

describe('context demo', () => {
  it('paints each label with the nearest provider and recolors only what is under the outer one', async () => {
    const demo = create() as HTMLElement;
    document.body.append(demo);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const root = demo.shadowRoot!;
    const labels = [...root.querySelectorAll<HTMLElement>('p')];
    expect(labels.map((label) => label.style.color)).toEqual(['#1665e0', '#1665e0', '#d6336c', '']);
    root.querySelectorAll<HTMLButtonElement>('.bar button')[1]!.click();
    expect(labels[0]!.style.color).toBe('#2f9e44');
    expect(labels[2]!.style.color).toBe('#d6336c');
    expect(root.querySelector('small')?.textContent).toContain('outer #2f9e44');
  });
});
