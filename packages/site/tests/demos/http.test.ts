import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/http';

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
  const names = () => [...root.querySelectorAll('li')].map((li) => li.textContent);
  const status = () => root.querySelector('p')!.textContent;
  const [previous, next] = [...root.querySelectorAll<HTMLButtonElement>('.bar button')];
  const broken = root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  return { names, status, previous: previous!, next: next!, broken };
};

describe('http demo', () => {
  it('loads the first page from the fake server', async () => {
    const { names, status } = open();
    expect(status()).toBe('Loading...');
    await vi.advanceTimersByTimeAsync(500);
    expect(names()).toEqual(['Ada', 'Grace', 'Linus']);
    expect(status()).toBe('Page 1 loaded');
  });

  it('pages forward and back, and stops at the ends', async () => {
    const { names, next, previous } = open();
    await vi.advanceTimersByTimeAsync(500);
    next.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(names()).toEqual(['Margaret', 'Dennis', 'Barbara']);
    next.click();
    await vi.advanceTimersByTimeAsync(500);
    next.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(names()).toEqual(['Ken', 'Radia']);
    previous.click();
    await vi.advanceTimersByTimeAsync(500);
    previous.click();
    await vi.advanceTimersByTimeAsync(500);
    previous.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(names()).toEqual(['Ada', 'Grace', 'Linus']);
  });

  it('aborts the request that a newer page replaced', async () => {
    const { names, next, status } = open();
    await vi.advanceTimersByTimeAsync(500);
    next.click();
    await vi.advanceTimersByTimeAsync(100);
    next.click();
    await vi.advanceTimersByTimeAsync(500);
    expect(names()).toEqual(['Ken', 'Radia']);
    expect(status()).toBe('Page 3 loaded');
  });

  it('retries a broken server twice and then reports the failure', async () => {
    const { names, next, broken, status } = open();
    await vi.advanceTimersByTimeAsync(500);
    broken.checked = true;
    broken.dispatchEvent(new Event('change'));
    next.click();
    await vi.advanceTimersByTimeAsync(500 + 300 + 500 + 300 + 500);
    expect(status()).toBe('Failed: Request failed with status code 503');
    expect(names()).toEqual(['Ada', 'Grace', 'Linus']);
  });
});
