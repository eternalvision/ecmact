import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/lifecycle';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await vi.advanceTimersByTimeAsync(0);
  const root = demo.shadowRoot!;
  return {
    root,
    text: () => root.querySelector('small')!.textContent!,
    toggle: root.querySelector<HTMLButtonElement>('button')!,
    freeze: root.querySelector<HTMLInputElement>('input[type="checkbox"]')!,
  };
};

describe('lifecycle demo', () => {
  it('mounts the clock once and repaints every second', async () => {
    const { text } = await open();
    expect(text()).toContain('mounted 1, unmounted 0');
    await vi.advanceTimersByTimeAsync(1000);
    expect(text()).toContain('repainted');
  });

  it('removes the clock, runs its cleanup and mounts it again', async () => {
    const { text, toggle } = await open();
    toggle.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(text()).toContain('unmounted 1');
    expect(toggle.textContent).toBe('Add the clock');
    toggle.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(text()).toContain('mounted 2');
  });

  it('stops repainting while frozen', async () => {
    const { text, freeze, root } = await open();
    freeze.checked = true;
    freeze.dispatchEvent(new Event('change'));
    const before = text();
    await vi.advanceTimersByTimeAsync(3000);
    expect(text()).toBe(before);
    expect(root.querySelector('output')).not.toBeNull();
  });
});
