import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/darkroom';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const button = (name: string) =>
    [...root.querySelectorAll<HTMLButtonElement>('.acts button')].find(
      (control) => control.textContent === name,
    )!;
  const log = () => [...root.querySelectorAll('.log li')].map((line) => line.textContent);
  const trayOfPrint = () =>
    [...root.querySelectorAll('.tray')].findIndex((tray) => tray.querySelector('em-print'));
  const print = () => root.querySelector('em-print') as HTMLElement | null;
  const density = () =>
    print()!.shadowRoot!.querySelector<HTMLElement>('.picture')!.style.getPropertyValue('--d');
  return { demo, root, button, log, trayOfPrint, print, density };
};

describe('darkroom example', () => {
  it('starts with the print in the developer, its timer started', () => {
    const { log, trayOfPrint, root } = open();
    expect(root.querySelectorAll('.tray')).toHaveLength(3);
    expect([...root.querySelectorAll('.tray')].map((tray) => tray.firstChild?.textContent)).toEqual(
      ['Developer', 'Stop bath', 'Fixer'],
    );
    expect(trayOfPrint()).toBe(0);
    expect(log()).toEqual(['mounted: timer started']);
  });

  it('develops the print while it is in a tray', async () => {
    const { density } = open();
    expect(density()).toBe('0');
    await vi.advanceTimersByTimeAsync(1000);
    expect(density()).toBe('20');
  });

  it('logs the effect that the print started when it is fully developed', async () => {
    const { log } = open();
    await vi.advanceTimersByTimeAsync(6000);
    expect(log()).toEqual(['mounted: timer started', 'effect: the print is fully developed']);
  });

  it('runs the cleanup, unmounted and mounted, in that order, when the print is moved', async () => {
    const { log, button, trayOfPrint, print } = open();
    const first = print();
    button('Move to the next tray').click();
    expect(trayOfPrint()).toBe(1);
    expect(print()).toBe(first);
    expect(log()).toEqual([
      'mounted: timer started',
      'cleanup: timer stopped',
      'unmounted',
      'mounted: timer started',
    ]);
    button('Move to the next tray').click();
    button('Move to the next tray').click();
    expect(trayOfPrint()).toBe(0);
    expect(log()).toHaveLength(5);
    expect(log()[4]).toBe('mounted: timer started');
  });

  it('stops the timer when the print is pulled out, and starts a new one when it is put in', async () => {
    const { log, button, trayOfPrint, print, density } = open();
    await vi.advanceTimersByTimeAsync(500);
    button('Pull out').click();
    expect(print()).toBeNull();
    expect(log()).toEqual(['mounted: timer started', 'cleanup: timer stopped', 'unmounted']);
    expect(button('Pull out').getAttribute('aria-disabled')).toBe('true');
    expect(button('Put the print in')).toBeDefined();
    await vi.advanceTimersByTimeAsync(5000);
    expect(vi.getTimerCount()).toBe(0);
    button('Pull out').click();
    button('Drop it').click();
    expect(log()).toHaveLength(3);
    button('Put the print in').click();
    expect(trayOfPrint()).toBe(0);
    expect(log()[3]).toBe('mounted: timer started');
    expect(button('Pull out').getAttribute('aria-disabled')).toBe('false');
    await vi.advanceTimersByTimeAsync(500);
    expect(density()).toBe('20');
  });

  it('reports a throw in the cleanup to the error prop with its phase, and still runs unmounted and stops the rest', async () => {
    const { log, button, print } = open();
    await vi.advanceTimersByTimeAsync(500);
    button('Drop it').click();
    expect(print()).toBeNull();
    expect(log()).toEqual([
      'mounted: timer started',
      'cleanup: timer stopped',
      'error in cleanup: the tongs slipped',
      'unmounted',
    ]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(log()).toHaveLength(4);
    expect(vi.getTimerCount()).toBe(0);
    button('Put the print in').click();
    button('Pull out').click();
    expect(log().slice(-3)).toEqual([
      'mounted: timer started',
      'cleanup: timer stopped',
      'unmounted',
    ]);
  });

  it('keeps the last five lines of the log', () => {
    const { log, button } = open();
    for (let count = 0; count < 4; count++) button('Move to the next tray').click();
    expect(log()).toHaveLength(5);
  });
});
