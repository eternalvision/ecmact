import { defineFeedLamp } from '@site/widgets/feedLamp';
import { defineMoonDial } from '@site/widgets/moonDial';
import { definePrintQuote } from '@site/widgets/printQuote';
import { defineProofClock } from '@site/widgets/proofClock';
import { defineRowCounter } from '@site/widgets/rowCounter';

/**
 * Registers every widget of the gallery, each once. The script that host pages load calls it; calling it again
 * does nothing.
 */
export const defineAll = () => {
  const widgets: [string, () => unknown][] = [
    ['print-quote', definePrintQuote],
    ['moon-dial', defineMoonDial],
    ['proof-clock', defineProofClock],
    ['row-counter', defineRowCounter],
    ['feed-lamp', defineFeedLamp],
  ];
  widgets.forEach(([name, define]) => {
    if (!customElements.get(name)) define();
  });
};
