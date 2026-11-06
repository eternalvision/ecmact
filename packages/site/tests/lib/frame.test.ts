import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitFrame } from '@site/lib/frame';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Creates a frame whose page has a given document and whose box has a given border.
 *
 * @param document - What `contentDocument` returns.
 * @param border - The border of the frame in pixels, on top and bottom together.
 * @returns The frame.
 */
const frameWith = (document: unknown, border = 0) => {
  const frame = window.document.createElement('iframe');
  Object.defineProperty(frame, 'contentDocument', { get: () => document });
  Object.defineProperty(frame, 'offsetHeight', { get: () => 500 + border });
  Object.defineProperty(frame, 'clientHeight', { get: () => 500 });
  return frame;
};

/**
 * Replaces ResizeObserver with a recording one.
 *
 * @returns What the observers did.
 */
const stubObserver = () => {
  const log = { created: 0, observed: [] as unknown[], disconnected: 0, notify: () => {} };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      /**
       * Keeps the callback.
       *
       * @param callback - The callback.
       */
      constructor(callback: () => void) {
        log.created++;
        log.notify = callback;
      }
      /**
       * Records what is observed.
       *
       * @param target - The element.
       */
      observe(target: unknown) {
        log.observed.push(target);
      }
      /** Records that the observer was disconnected. */
      disconnect() {
        log.disconnected++;
      }
    },
  );
  return log;
};

describe('fitFrame', () => {
  it('turns the scrollbar off, takes the height of the page plus the border, and follows the page both ways', () => {
    const log = stubObserver();
    const page = { documentElement: { offsetHeight: 700 } };
    const frame = frameWith(page, 2);
    fitFrame(frame);
    expect(frame.getAttribute('scrolling')).toBe('no');
    frame.dispatchEvent(new Event('load'));
    expect(frame.style.height).toBe('702px');
    expect(log.observed).toEqual([page.documentElement]);
    page.documentElement.offsetHeight = 900;
    log.notify();
    expect(frame.style.height).toBe('902px');
    page.documentElement.offsetHeight = 400;
    log.notify();
    expect(frame.style.height).toBe('402px');
  });

  it('observes the new page after a reload and lets the old observer go', () => {
    const log = stubObserver();
    const frame = frameWith({ documentElement: { offsetHeight: 100 } });
    fitFrame(frame);
    frame.dispatchEvent(new Event('load'));
    frame.dispatchEvent(new Event('load'));
    expect(log.created).toBe(2);
    expect(log.disconnected).toBe(1);
  });

  it('does nothing while the page is not reachable', () => {
    const log = stubObserver();
    const frame = frameWith(null);
    fitFrame(frame);
    frame.dispatchEvent(new Event('load'));
    expect(frame.style.height).toBe('');
    expect(log.created).toBe(0);
  });
});
