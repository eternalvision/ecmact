import { effect, type ReadonlySignal } from 'ecmact';

/** How long the two halves of a flip take together, in milliseconds. Keep it equal to the CSS animations. */
export const flipDuration = 600;

/** The stylesheet of a flip card: the four halves, the hinge and the two animations. */
export const flipCss = `
  .digit { position: relative; height: var(--flip-h, 4.2rem); perspective: 22rem; font-size: calc(var(--flip-h, 4.2rem) * 0.52); font-weight: 700; font-variant-numeric: tabular-nums; }
  .half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; background: var(--flip-bg); box-shadow: inset 0 0 0 1px var(--flip-edge); backface-visibility: hidden; }
  .half span { position: absolute; left: 0; right: 0; height: var(--flip-h, 4.2rem); line-height: var(--flip-h, 4.2rem); text-align: center; }
  .half.top { top: 0; border-radius: var(--flip-r, 10px) var(--flip-r, 10px) 0 0; transform-origin: 50% 100%; }
  .half.top span { top: 0; }
  .half.bottom { top: 50%; border-radius: 0 0 var(--flip-r, 10px) var(--flip-r, 10px); transform-origin: 50% 0; background: var(--flip-bg-low, var(--flip-bg)); }
  .half.bottom span { bottom: 0; }
  .digit::after { content: ''; position: absolute; left: 0; right: 0; top: calc(50% - 0.5px); height: 1px; z-index: 5; background: var(--flip-gap); }
  .flap { display: none; }
  .flip .flap { display: block; }
  .flip .flap.top { z-index: 3; animation: flip-top 0.3s ease-in forwards; }
  .flip .flap.bottom { z-index: 4; transform: rotateX(90deg); animation: flip-bottom 0.3s 0.3s ease-out forwards; }
  @keyframes flip-top { to { transform: rotateX(-90deg); } }
  @keyframes flip-bottom { to { transform: rotateX(0); } }
  @media (prefers-reduced-motion: reduce) { .flip .flap { animation-duration: 0.01s; } .flip .flap.bottom { animation-delay: 0.01s; } }
`;

/** A card that flips when its text changes, like the cards of a mechanical flip clock. */
export interface FlipCard {
  /** The element to put into the page. */
  element: HTMLElement;
  /**
   * Starts following the signal.
   *
   * @returns A function that stops following it and cancels a flip in progress.
   */
  start: () => () => void;
}

/**
 * Creates a flip card. The text is cut at the hinge: the top half shows the upper part of the characters and the
 * bottom half the lower part. When the signal changes, the top half folds down showing the old text while the new
 * text appears under it, and the bottom half unfolds with the new one.
 *
 * @param value - The text to show.
 * @returns The card.
 */
export const createFlipCard = (value: ReadonlySignal<string>): FlipCard => {
  const root = document.createElement('div');
  root.className = 'digit';
  /**
   * Creates one half of the card.
   *
   * @param classes - Its classes.
   * @returns The half and the span with its text.
   */
  const half = (classes: string) => {
    const element = document.createElement('div');
    element.className = `half ${classes}`;
    const text = document.createElement('span');
    element.append(text);
    root.append(element);
    return text;
  };
  const top = half('top');
  const bottom = half('bottom');
  const flapTop = half('top flap');
  const flapBottom = half('bottom flap');
  let current = '';
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Puts the final text into the bottom half and ends the flip. */
  const settle = () => {
    bottom.textContent = current;
    root.classList.remove('flip');
  };

  /**
   * Shows a new text, with a flip unless it is the first one.
   *
   * @param next - The text.
   */
  const show = (next: string) => {
    if (next === current) return;
    const first = current === '';
    flapTop.textContent = current;
    flapBottom.textContent = next;
    top.textContent = next;
    if (first) {
      flapTop.textContent = next;
      current = next;
      settle();
      return;
    }
    clearTimeout(timer);
    root.classList.remove('flip');
    void root.offsetWidth;
    root.classList.add('flip');
    current = next;
    timer = setTimeout(settle, flipDuration);
  };

  return {
    element: root,
    start: () => {
      const stop = effect(() => show(value.value));
      return () => {
        stop();
        clearTimeout(timer);
      };
    },
  };
};
