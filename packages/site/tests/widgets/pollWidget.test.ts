import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPollStore, definePollWidget, parseList } from '@site/widgets/pollWidget';
import { mountWidget } from '@tests/widgets/helpers';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  if (!customElements.get('poll-widget')) definePollWidget();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('parseList', () => {
  it('splits, trims and drops blanks', () => {
    expect(parseList(' a, b ,, c ')).toEqual(['a', 'b', 'c']);
    expect(parseList(undefined)).toEqual([]);
    expect(parseList(null)).toEqual([]);
  });
});

describe('createPollStore', () => {
  it('moves a vote and takes it back', () => {
    const store = createPollStore('store-test', { a: 1, b: 0 });
    store.getState().vote('a');
    expect(store.getState().votes).toEqual({ a: 2, b: 0 });
    store.getState().vote('b');
    expect(store.getState().votes).toEqual({ a: 1, b: 1 });
    store.getState().reset();
    expect(store.getState().votes).toEqual({ a: 1, b: 0 });
    expect(store.getState().chosen).toBeNull();
    store.getState().reset();
    expect(store.getState().votes).toEqual({ a: 1, b: 0 });
  });

  it('copes with a choice that the votes do not know', () => {
    const store = createPollStore('store-ghost', {});
    store.setState({ chosen: 'Gone', votes: {} });
    store.getState().vote('x');
    expect(store.getState().votes).toEqual({ Gone: 0, x: 1 });
    store.setState({ chosen: 'Lost', votes: {} });
    store.getState().reset();
    expect(store.getState().votes).toEqual({ Lost: 0 });
  });

  it('counts a vote for an option that was not seeded', () => {
    const store = createPollStore('store-extra', {});
    store.getState().vote('x');
    expect(store.getState().votes).toEqual({ x: 1 });
  });
});

describe('poll-widget', () => {
  it('shows the defaults', async () => {
    const { text, root } = await mountWidget('poll-widget');
    expect(text()).toContain('What do you think?');
    expect(root.querySelectorAll('button.option')).toHaveLength(2);
    expect(text()).toContain('0 votes');
  });

  it('shows shares after a vote, announces it and lets the visitor take it back', async () => {
    const { element, root, text } = await mountWidget('poll-widget', {
      poll: 'widget-test',
      question: 'Tea or coffee?',
      options: 'Tea, Coffee',
      seed: '1',
    });
    const votes: unknown[] = [];
    element.addEventListener('vote', (event) => votes.push((event as CustomEvent).detail));
    expect(text()).toContain('1 vote');
    expect(text()).not.toContain('1 votes');
    const [tea, coffee] = [...root.querySelectorAll<HTMLButtonElement>('button.option')];
    coffee!.click();
    expect(votes).toEqual([{ option: 'Coffee' }]);
    expect(text()).toContain('50%');
    expect(text()).toContain('2 votes');
    tea!.click();
    expect(tea!.getAttribute('aria-pressed')).toBe('true');
    const back = [...root.querySelectorAll('button')].find(
      (button) => button.textContent === 'Take my vote back',
    )!;
    back.click();
    expect(text()).toContain('1 vote');
  });

  it('shows zero shares for a choice without votes and for options added later', async () => {
    const { element, root, text } = await mountWidget('poll-widget', {
      poll: 'ghost',
      options: 'A, B',
    });
    const { createPollStore: create } = await import('@site/widgets/pollWidget');
    create('ghost', {}).setState({ chosen: 'Gone', votes: {} });
    await vi.advanceTimersByTimeAsync(0);
    expect(text()).toContain('0%');
    create('ghost', {}).setState({ chosen: 'A', votes: { A: 2 } });
    element.setAttribute('options', 'A, B, C');
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelectorAll('button.option')).toHaveLength(3);
    expect(text()).toContain('100%');
  });

  it('shares its votes between copies through the poll id', async () => {
    const first = await mountWidget('poll-widget', { poll: 'shared', options: 'A, B' });
    first.root.querySelector<HTMLButtonElement>('button.option')!.click();
    const second = await mountWidget('poll-widget', { poll: 'shared', options: 'A, B' });
    expect(second.text()).toContain('1 vote');
  });
});
