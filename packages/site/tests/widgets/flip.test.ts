import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from 'ecmact';
import { createFlipCard, flipCss, flipDuration } from '@site/widgets/flip';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
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

  it('is one image with the text as its label, and hides the halves from assistive technology', () => {
    const value = signal('07');
    const card = createFlipCard(value);
    card.start();
    expect(card.element.getAttribute('role')).toBe('img');
    expect(card.element.getAttribute('aria-label')).toBe('07');
    expect(
      [...card.element.querySelectorAll('.half')].every(
        (half) => half.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
    value.value = '06';
    expect(card.element.getAttribute('aria-label')).toBe('06');
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

  it('skips the flip for a visitor who prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }));
    const value = signal('07');
    const card = createFlipCard(value);
    card.start();
    value.value = '06';
    expect(card.element.classList.contains('flip')).toBe(false);
    expect(spans(card.element)).toEqual(['06', '06', '06', '06']);
  });

  it('flips where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined);
    const value = signal('07');
    const card = createFlipCard(value);
    card.start();
    value.value = '06';
    expect(card.element.classList.contains('flip')).toBe(true);
  });

  it('stops following the signal, and a flip in progress is settled, not left half done', () => {
    const value = signal('03');
    const card = createFlipCard(value);
    const stop = card.start();
    value.value = '02';
    expect(card.element.classList.contains('flip')).toBe(true);
    stop();
    expect(card.element.classList.contains('flip')).toBe(false);
    expect(spans(card.element).slice(0, 2)).toEqual(['02', '02']);
    value.value = '01';
    expect(vi.getTimerCount()).toBe(0);
    expect(spans(card.element)[0]).toBe('02');
  });

  it('flips correctly after it was stopped and started again', () => {
    const value = signal('03');
    const card = createFlipCard(value);
    card.start()();
    value.value = '02';
    card.start();
    vi.advanceTimersByTime(flipDuration);
    value.value = '01';
    vi.advanceTimersByTime(flipDuration);
    expect(spans(card.element)).toEqual(['01', '01', '02', '01']);
  });
});

describe('flipCss', () => {
  it('has the hinge and both animations, with the duration of the script', () => {
    expect(flipCss).toContain('@keyframes flip-top');
    expect(flipCss).toContain('@keyframes flip-bottom');
    expect(flipCss).toContain(`flip-top ${flipDuration / 2}ms`);
    expect(flipCss).toContain(`flip-bottom ${flipDuration / 2}ms ${flipDuration / 2}ms`);
  });
});
