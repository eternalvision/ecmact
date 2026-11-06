import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitFrame } from '@site/lib/frame';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Creates a frame whose page has a given document.
 *
 * @param document - What `contentDocument` returns.
 * @returns The frame.
 */
const frameWith = (document: unknown) => {
  const frame = window.document.createElement('iframe');
  Object.defineProperty(frame, 'contentDocument', { get: () => document });
  return frame;
};

describe('fitFrame', () => {
  it('turns the scrollbar off, takes the height of the page and follows it', () => {
    let height = 700;
    let notify: () => void = () => undefined;
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        /**
         * Keeps the callback.
         *
         * @param callback - The callback.
         */
        constructor(callback: () => void) {
          notify = callback;
        }
        observe = observe;
      },
    );
    const page = {
      documentElement: {
        get scrollHeight() {
          return height;
        },
      },
      body: {},
    };
    const frame = frameWith(page);
    fitFrame(frame);
    expect(frame.getAttribute('scrolling')).toBe('no');
    frame.dispatchEvent(new Event('load'));
    expect(frame.style.height).toBe('700px');
    expect(observe).toHaveBeenCalledWith(page.body);
    height = 900;
    notify();
    expect(frame.style.height).toBe('900px');
  });

  it('does nothing while the page is not reachable', () => {
    const frame = frameWith(null);
    fitFrame(frame);
    frame.dispatchEvent(new Event('load'));
    expect(frame.style.height).toBe('');
  });

  it('does not observe a page without a body', () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
      },
    );
    const frame = frameWith({ documentElement: { scrollHeight: 10 }, body: null });
    fitFrame(frame);
    frame.dispatchEvent(new Event('load'));
    expect(observe).not.toHaveBeenCalled();
    expect(frame.style.height).toBe('10px');
  });
});
