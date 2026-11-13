import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/lifecycle';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2027, 0, 1, 10, 20, 30));
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  return {
    demo,
    root,
    clock: () => root.querySelector('em-clock')?.shadowRoot?.textContent,
    stage: () => root.querySelector('.stage')!.textContent,
    text: () => root.querySelector('small')!.textContent,
    toggle: root.querySelector('button')!,
  };
};

describe('lifecycle demo', () => {
  it('shows the time of day as hours, minutes and seconds', () => {
    const { clock, text } = open();
    expect(clock()).toBe('10:20:30');
    expect(text()).toBe('mounted 1, unmounted 0, the effect in mounted ran 1 times');
  });

  it('starts a timer when it is mounted, and the effect of the clock follows the time', async () => {
    const { clock, text } = open();
    await vi.advanceTimersByTimeAsync(2000);
    expect(clock()).toBe('10:20:32');
    expect(text()).toBe('mounted 1, unmounted 0, the effect in mounted ran 3 times');
  });

  it('removes the clock: unmounted runs and the effect stops by itself, while the time goes on', async () => {
    const { clock, stage, text, toggle } = open();
    toggle.click();
    expect(toggle.textContent).toBe('Add the clock');
    expect(clock()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(3000);
    expect(stage()).toBe('No clock, but it is 10:20:33');
    expect(text()).toBe('mounted 1, unmounted 1, the effect in mounted ran 1 times');
  });

  it('mounts the clock again when it is put back, with a new effect', async () => {
    const { clock, text, toggle } = open();
    toggle.click();
    await vi.advanceTimersByTimeAsync(1000);
    toggle.click();
    expect(toggle.textContent).toBe('Remove the clock');
    expect(clock()).toBe('10:20:31');
    await vi.advanceTimersByTimeAsync(1000);
    expect(clock()).toBe('10:20:32');
    expect(text()).toBe('mounted 2, unmounted 1, the effect in mounted ran 3 times');
  });

  it('stops its timer with the cleanup of mounted when the demo leaves the page', async () => {
    const { demo } = open();
    expect(vi.getTimerCount()).toBe(1);
    demo.remove();
    expect(vi.getTimerCount()).toBe(0);
  });
});
