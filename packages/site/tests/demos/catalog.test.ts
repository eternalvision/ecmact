import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/catalog';

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
  const root = demo.shadowRoot!;
  await vi.advanceTimersByTimeAsync(200);
  const titles = () => [...root.querySelectorAll('.card b')].map((title) => title.textContent);
  const search = (text: string) => {
    const field = root.querySelector<HTMLInputElement>('input')!;
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const borrow = (title: string) =>
    [...root.querySelectorAll<HTMLButtonElement>('.card button')].find((button) =>
      button.getAttribute('aria-label')?.endsWith(title),
    )!;
  const onLoan = () =>
    [...root.querySelectorAll('.card')]
      .filter((card) => !card.querySelector<HTMLElement>('.due')!.hidden)
      .map((card) => card.querySelector('b')!.textContent);
  const desk = () => root.querySelector('.desk')!.textContent;
  const notice = () => root.querySelector('.notice')!.textContent;
  const toggleDesk = root.querySelector<HTMLButtonElement>('.open')!;
  return { demo, root, titles, search, borrow, onLoan, desk, notice, toggleDesk };
};

describe('catalog example', () => {
  it('lists every card of the drawer at first, with its shelf mark', async () => {
    const { titles, root } = await open();
    expect(titles()).toHaveLength(6);
    expect(titles()[0]).toBe('Marsh Birds of the North Shore');
    expect(root.querySelector('.card small')?.textContent).toBe('Shelf 598.2 · 1961');
  });

  it('keeps the cards in a scrollable region that the keyboard can reach, so the desk stays near', async () => {
    const { root } = await open();
    const list = root.querySelector('.list')!;
    expect(list.getAttribute('role')).toBe('region');
    expect(list.getAttribute('aria-label')).toBe('Cards');
    expect(list.getAttribute('tabindex')).toBe('0');
    expect(list.querySelectorAll('.card')).toHaveLength(6);
  });

  it('searches the drawer, ignoring case and spaces around the words', async () => {
    const { titles, search } = await open();
    search('  KNOTS ');
    await vi.advanceTimersByTimeAsync(1000);
    expect(titles()).toEqual(['A Short History of Knots']);
  });

  it('says so when no card matches', async () => {
    const { root, search } = await open();
    search('zeppelin');
    await vi.advanceTimersByTimeAsync(1000);
    expect(root.querySelectorAll('.card')).toHaveLength(0);
    expect(root.querySelector('.none')?.textContent).toBe('No card matches "zeppelin".');
  });

  it('aborts the older search when a newer one starts, and a late answer never replaces the newer one', async () => {
    const { titles, search } = await open();
    search('s');
    await vi.advanceTimersByTimeAsync(100);
    search('sa');
    await vi.advanceTimersByTimeAsync(100);
    search('salt');
    await vi.advanceTimersByTimeAsync(2000);
    expect(titles()).toEqual(['Salt, Slowly']);
  });

  it('does not let an answer that was already on its way when its search was replaced overwrite the cards', async () => {
    const { titles, search } = await open();
    search('t');
    vi.advanceTimersByTime(550);
    search('tide');
    await vi.advanceTimersByTimeAsync(10);
    expect(titles()).toHaveLength(6);
    await vi.advanceTimersByTimeAsync(2000);
    expect(titles()).toEqual(['Tides and the People Who Read Them']);
  });

  it('borrows a book at once and keeps it on loan when the desk agrees', async () => {
    const { borrow, onLoan, desk } = await open();
    const button = borrow('Salt, Slowly');
    expect(button.textContent).toBe('Borrow');
    button.click();
    expect(onLoan()).toEqual(['Salt, Slowly']);
    expect(button.textContent).toBe('Return');
    await vi.advanceTimersByTimeAsync(500);
    expect(onLoan()).toEqual(['Salt, Slowly']);
    expect(desk()).toBe('desk: 1 of 5 requests in this window');
    button.click();
    expect(onLoan()).toEqual([]);
    await vi.advanceTimersByTimeAsync(500);
    expect(onLoan()).toEqual([]);
  });

  it('rolls a borrow back and says why when the closed desk answers 503', async () => {
    const { borrow, onLoan, notice, toggleDesk } = await open();
    toggleDesk.click();
    expect(toggleDesk.textContent).toBe('Open the desk');
    borrow('Salt, Slowly').click();
    expect(onLoan()).toEqual(['Salt, Slowly']);
    await vi.advanceTimersByTimeAsync(500);
    expect(onLoan()).toEqual([]);
    expect(notice()).toBe(
      'The desk is closed, so "Salt, Slowly" was not borrowed. The loan is rolled back.',
    );
    toggleDesk.click();
    expect(toggleDesk.textContent).toBe('Close the desk');
    borrow('Salt, Slowly').click();
    expect(notice()).toBe('');
    await vi.advanceTimersByTimeAsync(500);
    expect(onLoan()).toEqual(['Salt, Slowly']);
  });

  it('rolls a return back when the desk closes in between', async () => {
    const { borrow, onLoan, notice, toggleDesk } = await open();
    borrow('Salt, Slowly').click();
    await vi.advanceTimersByTimeAsync(500);
    toggleDesk.click();
    borrow('Salt, Slowly').click();
    expect(onLoan()).toEqual([]);
    await vi.advanceTimersByTimeAsync(500);
    expect(onLoan()).toEqual(['Salt, Slowly']);
    expect(notice()).toContain('was not returned');
  });

  it('answers the sixth request of a window with 429, shows the wait, and ends it', async () => {
    const { borrow, onLoan, desk, notice } = await open();
    for (let count = 0; count < 5; count++) {
      borrow('Salt, Slowly').click();
      await vi.advanceTimersByTimeAsync(300);
    }
    expect(desk()).toBe('desk: 5 of 5 requests in this window');
    expect(onLoan()).toEqual(['Salt, Slowly']);
    borrow('Salt, Slowly').click();
    expect(onLoan()).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    expect(onLoan()).toEqual(['Salt, Slowly']);
    expect(notice()).toBe(
      'The desk is busy, so "Salt, Slowly" was not returned. The loan is rolled back.',
    );
    expect(desk()).toMatch(/^desk: too many requests, wait \d+ s$/);
    await vi.advanceTimersByTimeAsync(3000);
    expect(desk()).toMatch(/^desk: too many requests, wait \d+ s$/);
    await vi.advanceTimersByTimeAsync(7000);
    expect(desk()).toBe('desk: 0 of 5 requests in this window');
    borrow('Salt, Slowly').click();
    await vi.advanceTimersByTimeAsync(300);
    expect(onLoan()).toEqual([]);
    expect(desk()).toBe('desk: 1 of 5 requests in this window');
  });

  it('stops its clock when it leaves the page', async () => {
    const { demo, desk } = await open();
    demo.remove();
    await vi.advanceTimersByTimeAsync(5000);
    expect(desk()).toBe('desk: 0 of 5 requests in this window');
    expect(vi.getTimerCount()).toBe(0);
  });
});
