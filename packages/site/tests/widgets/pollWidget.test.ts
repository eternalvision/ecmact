import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  changeVotes,
  createPollStore,
  definePollWidget,
  parseList,
  pollStore,
  votesFor,
} from '@site/widgets/pollWidget';
import { mountWidget } from '@tests/widgets/helpers';

definePollWidget();

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

/**
 * Stores a value where a poll with this id will find it.
 *
 * @param poll - The id of the poll.
 * @param state - What to store as the persisted state.
 */
const store = (poll: string, state: unknown) =>
  localStorage.setItem(`ecmact-poll:${poll}`, JSON.stringify({ state, version: 0 }));

/**
 * Reads the shares and counts that a poll widget shows.
 *
 * @param root - The shadow root of the widget.
 * @returns The percentages of the rows and the footer text.
 */
const shown = (root: ShadowRoot) => ({
  shares: [...root.querySelectorAll('.share')].map((share) => share.textContent),
  total: root.querySelector('.total')?.textContent,
});

describe('parseList', () => {
  it('splits, trims and drops blanks', () => {
    expect(parseList(' a, b ,, c ')).toEqual(['a', 'b', 'c']);
    expect(parseList(undefined)).toEqual([]);
    expect(parseList(null)).toEqual([]);
  });
});

describe('votesFor and changeVotes', () => {
  it('read only own properties, so inherited names have no votes', () => {
    expect(votesFor({ a: 2 }, 'a')).toBe(2);
    expect(votesFor({ a: 2 }, 'b')).toBe(0);
    expect(votesFor({}, 'constructor')).toBe(0);
    expect(votesFor({}, 'toString')).toBe(0);
    expect(votesFor({}, '__proto__')).toBe(0);
  });

  it('change one count, never below zero, and keep odd names as own properties', () => {
    expect(changeVotes({ a: 1 }, 'a', 2)).toEqual({ a: 3 });
    expect(changeVotes({ a: 1 }, 'a', -5)).toEqual({ a: 0 });
    expect(changeVotes({ a: 1 }, 'b', 1)).toEqual({ a: 1, b: 1 });
    const proto = changeVotes({}, '__proto__', 1);
    expect(Object.hasOwn(proto, '__proto__')).toBe(true);
    expect(votesFor(proto, '__proto__')).toBe(1);
    expect(Object.getPrototypeOf(proto)).toBe(Object.prototype);
    expect(votesFor(changeVotes({}, 'constructor', 1), 'constructor')).toBe(1);
  });
});

describe('createPollStore', () => {
  it('moves a vote and takes it back', () => {
    const poll = createPollStore('store-test', { a: 1, b: 0 });
    poll.vote('a');
    expect(poll.votes).toEqual({ a: 2, b: 0 });
    poll.vote('b');
    expect(poll.votes).toEqual({ a: 1, b: 1 });
    poll.reset();
    expect(poll.votes).toEqual({ a: 1, b: 0 });
    expect(poll.chosen).toBeNull();
    poll.reset();
    expect(poll.votes).toEqual({ a: 1, b: 0 });
  });

  it('copes with a choice that the votes do not know', () => {
    const poll = createPollStore('store-ghost', {});
    poll.setState({ chosen: 'Gone', votes: {} });
    poll.vote('x');
    expect(poll.votes).toEqual({ Gone: 0, x: 1 });
    poll.setState({ chosen: 'Lost', votes: {} });
    poll.reset();
    expect(poll.votes).toEqual({ Lost: 0 });
  });

  it('counts a vote for an option that was not seeded', () => {
    const poll = createPollStore('store-extra', {});
    poll.vote('x');
    expect(poll.votes).toEqual({ x: 1 });
  });

  it('reads a stored poll back, and keeps it in storage after a vote', () => {
    store('stored', { votes: { a: 4, b: 1 }, chosen: 'b' });
    const poll = createPollStore('stored', { a: 0, b: 0 });
    expect(poll.votes).toEqual({ a: 4, b: 1 });
    expect(poll.chosen).toBe('b');
    poll.vote('a');
    expect(JSON.parse(localStorage.getItem('ecmact-poll:stored') ?? '{}').state).toEqual({
      votes: { a: 5, b: 0 },
      chosen: 'a',
    });
  });

  it('ignores a stored value that has the wrong shape, and keeps the starting votes', () => {
    for (const state of [null, 'text', 5, [], { votes: null, chosen: 5 }, { votes: [1, 2] }]) {
      store('broken', state);
      const poll = createPollStore('broken', { a: 3 });
      expect(poll.votes).toEqual({ a: 3 });
      expect(poll.chosen).toBeNull();
    }
  });

  it('drops stored counts that are not finite, non-negative numbers', () => {
    store('counts', { votes: { a: 2, b: -1, c: 'x', d: null, e: 7 }, chosen: 'e' });
    const poll = createPollStore('counts', {});
    expect(poll.votes).toEqual({ a: 2, e: 7 });
  });
});

describe('pollStore', () => {
  it('gives every copy of a poll the same store, with the starting votes of the first', () => {
    const first = pollStore('shared-store', { a: 1 });
    const second = pollStore('shared-store', { a: 9 });
    expect(second).toBe(first);
    expect(second.votes).toEqual({ a: 1 });
    expect(pollStore('other-store', {})).not.toBe(first);
  });
});

describe('poll-widget', () => {
  it('shows the defaults', async () => {
    const { text, root } = await mountWidget('poll-widget', { poll: 'defaults' });
    expect(text()).toContain('What do you think?');
    expect(root.querySelectorAll('button.option')).toHaveLength(2);
    expect(shown(root).total).toBe('0 votes');
  });

  it('shows shares after a vote, announces it and lets the visitor take it back', async () => {
    const votes: unknown[] = [];
    const { root } = await mountWidget(
      'poll-widget',
      { poll: 'widget-test', question: 'Tea or coffee?', options: 'Tea, Coffee', seed: '1' },
      { vote: (event) => votes.push(event.detail) },
    );
    expect(shown(root)).toEqual({ shares: ['', ''], total: '1 vote' });
    const [tea, coffee] = [...root.querySelectorAll<HTMLButtonElement>('button.option')];
    coffee!.click();
    expect(votes).toEqual([{ option: 'Coffee' }]);
    expect(shown(root)).toEqual({ shares: ['50%', '50%'], total: '2 votes' });
    tea!.click();
    expect(tea!.getAttribute('aria-pressed')).toBe('true');
    expect(shown(root)).toEqual({ shares: ['100%', '0%'], total: '2 votes' });
    const back = [...root.querySelectorAll('button')].find(
      (button) => button.textContent === 'Take my vote back',
    )!;
    back.click();
    expect(shown(root)).toEqual({ shares: ['', ''], total: '1 vote' });
  });

  it('shares votes between copies of the same poll at once', async () => {
    const first = await mountWidget('poll-widget', { poll: 'live', options: 'A, B' });
    const second = await mountWidget('poll-widget', { poll: 'live', options: 'A, B' });
    first.root.querySelector<HTMLButtonElement>('button.option')!.click();
    expect(shown(first.root).total).toBe('1 vote');
    expect(shown(second.root).total).toBe('1 vote');
    expect(shown(second.root).shares).toEqual(['100%', '0%']);
    second.root.querySelectorAll<HTMLButtonElement>('button.option')[1]!.click();
    expect(shown(first.root).total).toBe('1 vote');
    expect(JSON.parse(localStorage.getItem('ecmact-poll:live') ?? '{}').state.votes).toEqual({
      A: 0,
      B: 1,
    });
  });

  it('keeps polls without an id apart when their question or options differ', async () => {
    const first = await mountWidget('poll-widget', { question: 'Q1?', options: 'A, B' });
    first.root.querySelector<HTMLButtonElement>('button.option')!.click();
    const other = await mountWidget('poll-widget', { question: 'Q2?', options: 'A, B' });
    expect(shown(other.root).total).toBe('0 votes');
    const same = await mountWidget('poll-widget', { question: 'Q1?', options: 'A, B' });
    expect(shown(same.root).total).toBe('1 vote');
  });

  it('works with no attributes at all, and with only a question or only options', async () => {
    const bare = await mountWidget('poll-widget');
    expect(bare.root.querySelectorAll('button.option')).toHaveLength(2);
    const asked = await mountWidget('poll-widget', { question: 'Only a question?' });
    expect(asked.text()).toContain('Only a question?');
    const listed = await mountWidget('poll-widget', { options: 'X, Y, Z' });
    expect(listed.root.querySelectorAll('button.option')).toHaveLength(3);
  });

  it('counts an option once when it is listed twice', async () => {
    const { root } = await mountWidget('poll-widget', {
      poll: 'dupes',
      options: 'A, A, B',
      seed: '2, 2, 1',
    });
    expect(root.querySelectorAll('button.option')).toHaveLength(2);
    expect(shown(root).total).toBe('3 votes');
  });

  it('treats a malformed seed as zero votes', async () => {
    const { root } = await mountWidget('poll-widget', {
      poll: 'seeds',
      options: 'A, B',
      seed: 'n/a, 3',
    });
    expect(shown(root).total).toBe('3 votes');
  });

  it('does not read inherited members for options named like them', async () => {
    store('proto', { votes: { ok: 1 }, chosen: 'ok' });
    const { root } = await mountWidget('poll-widget', {
      poll: 'proto',
      options: 'ok, constructor, __proto__',
    });
    expect(shown(root)).toEqual({ shares: ['100%', '0%', '0%'], total: '1 vote' });
    root.querySelectorAll<HTMLButtonElement>('button.option')[1]!.click();
    root.querySelectorAll<HTMLButtonElement>('button.option')[2]!.click();
    expect(shown(root).total).toBe('1 vote');
    expect(shown(root).shares).toEqual(['0%', '0%', '100%']);
  });

  it('keeps the rows of the options that stay when the options change', async () => {
    const { element, root } = await mountWidget('poll-widget', {
      poll: 'rows',
      options: 'A, B',
    });
    const [first] = [...root.querySelectorAll('li')];
    element.setAttribute('options', 'A, B, C');
    await vi.advanceTimersByTimeAsync(0);
    const rows = [...root.querySelectorAll('li')];
    expect(rows).toHaveLength(3);
    expect(rows[0]).toBe(first);
    element.setAttribute('options', 'C');
    await vi.advanceTimersByTimeAsync(0);
    expect(root.querySelectorAll('li')).toHaveLength(1);
  });

  it('shows a share for an option that has no votes yet when a choice exists', async () => {
    store('late', { votes: { A: 2 }, chosen: 'A' });
    const { element, root } = await mountWidget('poll-widget', { poll: 'late', options: 'A' });
    element.setAttribute('options', 'A, B');
    await vi.advanceTimersByTimeAsync(0);
    expect(shown(root).shares).toEqual(['100%', '0%']);
  });

  it('hides the take-back link until the visitor has voted', async () => {
    const { root } = await mountWidget('poll-widget', { poll: 'link' });
    const back = [...root.querySelectorAll('button')].find(
      (button) => button.textContent === 'Take my vote back',
    )!;
    expect(back.hasAttribute('hidden')).toBe(true);
    root.querySelector<HTMLButtonElement>('button.option')!.click();
    expect(back.hasAttribute('hidden')).toBe(false);
  });
});
