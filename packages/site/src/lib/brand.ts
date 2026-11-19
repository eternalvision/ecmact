/**
 * The geometry of the ECMact identity, drawn once on a grid where the mark is 64 units tall. The header, the favicon
 * and the raster images in `public/` are all made from these strings, so the three cannot drift apart. After a change,
 * run `npm run brand:images` (`scripts/brand-images.mjs`) to render the images again.
 */
export const brand = {
  /** The solid square of the mark. */
  block: 'M0 0H64V64H0Z',
  /** The bracket and the letter E, which are knocked out of the block. */
  glyph: 'M10 10H25V19H19V45H25V54H10Z M35 10H54V19H44V27.5H51V36.5H44V45H54V54H35Z',
  /** The letters of the wordmark that are filled shapes: E, M and t. */
  wordFill:
    'M0 14H20V21H7V28.5H17V35.5H7V43H20V50H0Z ' +
    'M64 50V14H72L83.5 32L95 14H103V50H96V25.5L83.5 43.5L71 25.5V50Z ' +
    'M172 17H179V26H185V33H179V50H172V33H167V26H172Z ' +
    'M126 26H133V50H126Z',
  /** The letters of the wordmark that are strokes: C, the bowl of a and c. */
  wordStroke:
    'M55.11 22.68A14.5 14.5 0 1 0 55.11 41.32 ' +
    'M129.5 38A8.5 8.5 0 1 1 112.5 38A8.5 8.5 0 1 1 129.5 38 ' +
    'M157.51 32.53A8.5 8.5 0 1 0 157.51 43.47',
  /** The width of the strokes of the wordmark. */
  strokeWidth: 7,
  /** How far the wordmark sits from the left edge of the lockup. */
  wordOffset: 82,
  /** The width of the lockup. */
  lockupWidth: 267,
  /** The height of the mark and of the lockup. */
  height: 64,
} as const;
