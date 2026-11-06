import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from 'ecmact';
import { createFlipCard, flipCss, flipDuration } from '@site/widgets/flip';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const spans = (element: HTMLElement) =>
  [...element.querySelectorAll('.half')].map((half) => half.textContent);

describe('createFlipCard', () => {
  it('shows the first text on every half without a flip', () => {
    const card = createFlipCard(signal('07'));
    card.start();
    expect(spans(card.element)).toEqual(['07', '07', '07', '07']);
    expect(card.element.classList.contains('flip')).toBe(false);
  });

  it('flips to a new text and settles when the animation is over', () => {
    const value = signal('07');
    const card = createFlipCard(value);
    card.start();
    value.value = '06';
    expect(card.element.classList.contains('flip')).toBe(true);
    expect(spans(card.element)).toEqual(['06', '07', '07', '06']);
    vi.advanceTimersByTime(flipDuration);
    expect(card.element.classList.contains('flip')).toBe(false);
    expect(spans(card.element)).toEqual(['06', '06', '07', '06']);
  });

  it('restarts the flip when the text changes during one', () => {
    const value = signal('03');
    const card = createFlipCard(value);
    card.start();
    value.value = '02';
    vi.advanceTimersByTime(100);
    value.value = '01';
    vi.advanceTimersByTime(flipDuration);
    expect(spans(card.element)[1]).toBe('01');
  });

  it('does not flip for the same text', () => {
    const value = signal('03');
    const card = createFlipCard(value);
    card.start();
    value.value = '03';
    expect(card.element.classList.contains('flip')).toBe(false);
  });

  it('stops following the signal and cancels the timer', () => {
    const value = signal('03');
    const card = createFlipCard(value);
    const stop = card.start();
    value.value = '02';
    stop();
    value.value = '01';
    expect(vi.getTimerCount()).toBe(0);
    expect(spans(card.element)[0]).toBe('02');
  });
});

describe('flipCss', () => {
  it('has the hinge and both animations', () => {
    expect(flipCss).toContain('@keyframes flip-top');
    expect(flipCss).toContain('@keyframes flip-bottom');
  });
});
