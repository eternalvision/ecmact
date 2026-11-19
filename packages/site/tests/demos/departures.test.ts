import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/departures';

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
  const harbour = (name: string) =>
    [...root.querySelectorAll<HTMLButtonElement>('.tabs button')].find(
      (button) => button.textContent === name,
    )!;
  const control = (name: string) =>
    [...root.querySelectorAll<HTMLButtonElement>('.controls button')].find(
      (button) => button.textContent === name,
    )!;
  const rows = () =>
    [...root.querySelectorAll('.sailing')].map((row) =>
      [...row.querySelectorAll('span')].map((cell) => cell.firstChild?.textContent).join(' '),
    );
  const board = root.querySelector<HTMLElement>('.rows')!;
  const aborted = () => root.querySelector('.foot')!.textContent;
  return { root, harbour, control, rows, board, aborted };
};

describe('departures example', () => {
  it('shows a loading board, then the sailings of the North Pier', async () => {
    const { board, rows, harbour, aborted } = open();
    expect(board.getAttribute('aria-busy')).toBe('true');
    expect(board.textContent).toContain('Loading');
    expect(rows()).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    expect(board.getAttribute('aria-busy')).toBe('false');
    expect(rows()).toEqual(['07:10 Saltmarsh A', '07:45 Lighthouse B', '08:20 Saltmarsh A']);
    expect(harbour('North Pier').getAttribute('aria-pressed')).toBe('true');
    expect(aborted()).toBe('requests aborted: 0');
  });

  it('shows the board of the harbour that was chosen, with a cancelled sailing marked', async () => {
    const { rows, harbour, root } = open();
    await vi.advanceTimersByTimeAsync(300);
    harbour('Lighthouse').click();
    expect(harbour('Lighthouse').getAttribute('aria-pressed')).toBe('true');
    expect(rows()).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    expect(rows()).toEqual(['08:05 North Pier D', '10:40 North Pier D']);
    expect(root.querySelector('.off')?.textContent).toContain('cancelled, fog');
    harbour('Lighthouse').click();
    expect(rows()).toHaveLength(2);
  });

  it('shows only the harbour asked for last and counts the requests it aborted', async () => {
    const { rows, harbour, control, aborted } = open();
    await vi.advanceTimersByTimeAsync(300);
    control('Rough sea').click();
    harbour('Saltmarsh').click();
    await vi.advanceTimersByTimeAsync(400);
    harbour('Lighthouse').click();
    await vi.advanceTimersByTimeAsync(400);
    harbour('North Pier').click();
    await vi.advanceTimersByTimeAsync(10);
    expect(aborted()).toBe('requests aborted: 2');
    expect(rows()).toEqual([]);
    await vi.advanceTimersByTimeAsync(5000);
    expect(rows()).toEqual(['07:10 Saltmarsh A', '07:45 Lighthouse B', '08:20 Saltmarsh A']);
    expect(aborted()).toBe('requests aborted: 2');
  });

  it('does not count a request that had already been answered', async () => {
    const { harbour, aborted } = open();
    await vi.advanceTimersByTimeAsync(300);
    harbour('Saltmarsh').click();
    await vi.advanceTimersByTimeAsync(300);
    harbour('North Pier').click();
    await vi.advanceTimersByTimeAsync(300);
    expect(aborted()).toBe('requests aborted: 0');
  });

  it('asks the harbour office again when told to, and counts the request it replaces', async () => {
    const { control, aborted, board } = open();
    await vi.advanceTimersByTimeAsync(300);
    control('Ask again').click();
    expect(board.getAttribute('aria-busy')).toBe('true');
    control('Ask again').click();
    await vi.advanceTimersByTimeAsync(300);
    expect(aborted()).toBe('requests aborted: 1');
    expect(board.getAttribute('aria-busy')).toBe('false');
  });

  it('shows an error when the fog comes in, and the retry works once it clears', async () => {
    const { root, harbour, control, rows, board } = open();
    await vi.advanceTimersByTimeAsync(300);
    control('Fog').click();
    expect(control('Fog').getAttribute('aria-pressed')).toBe('true');
    harbour('Saltmarsh').click();
    await vi.advanceTimersByTimeAsync(300);
    expect(rows()).toEqual([]);
    expect(root.querySelector('.error')?.textContent).toContain(
      'Fog: the harbour office is not answering',
    );
    root.querySelector<HTMLButtonElement>('.error button')!.click();
    await vi.advanceTimersByTimeAsync(300);
    expect(root.querySelector('.error')).not.toBeNull();
    control('Fog').click();
    expect(control('Fog').getAttribute('aria-pressed')).toBe('false');
    (root.querySelector('.error button') as HTMLButtonElement).focus();
    (root.querySelector('.error button') as HTMLButtonElement).click();
    expect(root.querySelector('.error')).toBeNull();
    expect(root.activeElement).toBe(board);
    await vi.advanceTimersByTimeAsync(300);
    expect(rows()).toEqual(['07:30 North Pier C', '09:00 North Pier C']);
  });
});
